from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
import os
import json
from mysql.connector import connect, Error

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / 'server_state.json'

MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', '127.0.0.1'),
    'port': int(os.getenv('MYSQL_PORT', '3306')),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'hospital_protocol')
}

DB_READY = False

app = Flask(__name__, static_folder='.', static_url_path='')


def get_db_connection(with_database=True):
    config = MYSQL_CONFIG.copy()
    if not with_database:
        config.pop('database', None)
    return connect(**config)


def load_state_file():
    if not DATA_FILE.exists():
        save_state_file({'entries': [], 'alerts': [], 'notifications': [], 'medicines': []})
    try:
        with DATA_FILE.open('r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        save_state_file({'entries': [], 'alerts': [], 'notifications': [], 'medicines': []})
        return {'entries': [], 'alerts': [], 'notifications': [], 'medicines': []}


def save_state_file(state):
    with DATA_FILE.open('w', encoding='utf-8') as f:
        json.dump(state, f, indent=2)


def load_state_db():
    if not DB_READY:
        return load_state_file()

    state = {'entries': [], 'alerts': [], 'notifications': [], 'medicines': []}
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM entries ORDER BY timestamp DESC, id DESC')
            for row in cursor.fetchall():
                row['history'] = json.loads(row['history'] or '[]')
                state['entries'].append(row)
            cursor.execute('SELECT * FROM alerts ORDER BY timestamp DESC, id DESC')
            state['alerts'] = cursor.fetchall()
            cursor.execute('SELECT * FROM notifications ORDER BY timestamp DESC, id DESC')
            state['notifications'] = cursor.fetchall()
            cursor.execute('SELECT * FROM medicines ORDER BY id DESC')
            state['medicines'] = cursor.fetchall()
            cursor.close()
    except Error as exc:
        print('Failed to load state from MySQL:', exc)
        return load_state_file()

    return state


def save_entry_db(payload):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO entries (id, waste_type, category, quantity, status, nurse_name, timestamp, history, transit_start_time, transit_person, transit_note) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
            (
                payload.get('id'),
                payload.get('wasteType'),
                payload.get('category'),
                payload.get('quantity'),
                payload.get('status'),
                payload.get('nurseName'),
                payload.get('timestamp'),
                json.dumps(payload.get('history', [])),
                payload.get('transit_start_time', ''),
                payload.get('transit_person', ''),
                payload.get('transit_note', '')
            )
        )
        conn.commit()
        cursor.close()


def save_medicine_db(payload):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO medicines (id, name, category, arrival_date, mfg_date, exp_date) VALUES (%s, %s, %s, %s, %s, %s)',
            (
                payload.get('id'),
                payload.get('name'),
                payload.get('category'),
                payload.get('arrivalDate'),
                payload.get('mfgDate'),
                payload.get('expDate')
            )
        )
        conn.commit()
        cursor.close()


def update_entry_status_db(payload):
    entry_id = payload.get('id')
    new_status = payload.get('newStatus')
    actor = payload.get('actor', 'System')
    message = payload.get('message')
    transit_start_time = payload.get('transit_start_time', '')
    transit_person = payload.get('transit_person', '')
    transit_note = payload.get('transit_note', '')
    history_item = {
        'status': new_status,
        'timestamp': payload.get('history_timestamp') or payload.get('timestamp') or transit_start_time or '',
        'actor': actor,
        'note': message
    }

    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT history FROM entries WHERE id = %s', (entry_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            raise ValueError('Entry not found')

        history = json.loads(row['history'] or '[]')
        history.append(history_item)
        cursor.execute(
            'UPDATE entries SET status = %s, transit_start_time = %s, transit_person = %s, transit_note = %s, history = %s WHERE id = %s',
            (new_status, transit_start_time, transit_person, transit_note, json.dumps(history), entry_id)
        )
        conn.commit()
        cursor.close()


def save_alert_db(payload):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO alerts (id, hospital_name, location, message, timestamp, status, reported_by, resolved_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
            (
                payload.get('id'),
                payload.get('hospitalName'),
                payload.get('location'),
                payload.get('message'),
                payload.get('timestamp'),
                payload.get('status'),
                payload.get('reportedBy'),
                payload.get('resolvedAt', '')
            )
        )
        conn.commit()
        cursor.close()


def resolve_alert_db(payload):
    alert_id = payload.get('id')
    resolved_at = payload.get('resolvedAt', '')
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id FROM alerts WHERE id = %s', (alert_id,))
        if not cursor.fetchone():
            cursor.close()
            raise ValueError('Alert not found')
        cursor.execute('UPDATE alerts SET status = %s, resolved_at = %s WHERE id = %s', ('Resolved', resolved_at, alert_id))
        cursor.execute(
            'INSERT INTO notifications (id, recipient, message, timestamp, source) VALUES (%s, %s, %s, %s, %s)',
            (
                payload.get('notificationId') or f'NTF-{alert_id}',
                'Supervisor',
                payload.get('notificationMessage', 'Action will be taken immediately'),
                payload.get('timestamp', ''),
                'Govt Oversight'
            )
        )
        conn.commit()
        cursor.close()


def load_state():
    if DB_READY:
        return load_state_db()
    return load_state_file()


def init_database():
    global DB_READY
    try:
        with get_db_connection(with_database=False) as conn:
            conn.autocommit = True
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_CONFIG['database']}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.close()

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'CREATE TABLE IF NOT EXISTS entries (id VARCHAR(32) PRIMARY KEY, waste_type TEXT, category VARCHAR(64), quantity VARCHAR(64), status VARCHAR(32), nurse_name VARCHAR(128), timestamp VARCHAR(64), history TEXT, transit_start_time VARCHAR(64), transit_person VARCHAR(128), transit_note TEXT)'
            )
            cursor.execute(
                'CREATE TABLE IF NOT EXISTS alerts (id VARCHAR(32) PRIMARY KEY, hospital_name VARCHAR(255), location VARCHAR(255), message TEXT, timestamp VARCHAR(64), status VARCHAR(32), reported_by VARCHAR(128), resolved_at VARCHAR(64))'
            )
            cursor.execute(
                'CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(32) PRIMARY KEY, recipient VARCHAR(64), message TEXT, timestamp VARCHAR(64), source VARCHAR(64))'
            )
            cursor.execute(
                'CREATE TABLE IF NOT EXISTS medicines (id VARCHAR(32) PRIMARY KEY, name VARCHAR(255), category VARCHAR(128), arrival_date VARCHAR(32), mfg_date VARCHAR(32), exp_date VARCHAR(32))'
            )
            conn.commit()
            cursor.close()
        DB_READY = True
    except Error as exc:
        print('Unable to initialize MySQL backend:', exc)
        DB_READY = False


@app.route('/api/state', methods=['GET'])
def api_state():
    return jsonify(load_state())


@app.route('/api/entry', methods=['POST'])
def api_entry():
    payload = request.get_json(force=True)
    if DB_READY:
        save_entry_db(payload)
        return jsonify(load_state_db())

    state = load_state_file()
    entries = state.get('entries', [])
    entries.insert(0, payload)
    state['entries'] = entries
    save_state_file(state)
    return jsonify(state)


@app.route('/api/medicine', methods=['POST'])
def api_medicine():
    payload = request.get_json(force=True)
    if DB_READY:
        save_medicine_db(payload)
        return jsonify(load_state_db())

    state = load_state_file()
    medicines = state.get('medicines', [])
    medicines.insert(0, payload)
    state['medicines'] = medicines
    save_state_file(state)
    return jsonify(state)


@app.route('/api/update-status', methods=['POST'])
def api_update_status():
    payload = request.get_json(force=True)
    if DB_READY:
        try:
            update_entry_status_db(payload)
            return jsonify(load_state_db())
        except ValueError:
            return jsonify({'error': 'Entry not found'}), 404

    state = load_state_file()
    entry_id = payload.get('id')
    new_status = payload.get('newStatus')
    actor = payload.get('actor', 'System')
    message = payload.get('message')

    entry = next((item for item in state.get('entries', []) if item.get('id') == entry_id), None)
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    entry['status'] = new_status
    if new_status == 'In Transit':
        entry['transit_start_time'] = payload.get('transit_start_time') or entry.get('transit_start_time') or ''
        entry['transit_person'] = payload.get('transit_person') or entry.get('transit_person') or actor
        entry['transit_note'] = payload.get('transit_note') or entry.get('transit_note') or 'Dispatched from hospital facility'

    history_item = {
        'status': new_status,
        'timestamp': payload.get('history_timestamp') or payload.get('timestamp') or entry.get('transit_start_time') or '',
        'actor': actor,
        'note': message
    }
    entry.setdefault('history', []).append(history_item)
    save_state_file(state)
    return jsonify(state)


@app.route('/api/report-alert', methods=['POST'])
def api_report_alert():
    payload = request.get_json(force=True)
    if DB_READY:
        save_alert_db(payload)
        return jsonify(load_state_db())

    state = load_state_file()
    alerts = state.get('alerts', [])
    alerts.insert(0, payload)
    state['alerts'] = alerts
    save_state_file(state)
    return jsonify(state)


@app.route('/api/resolve-alert', methods=['POST'])
def api_resolve_alert():
    payload = request.get_json(force=True)
    if DB_READY:
        try:
            resolve_alert_db(payload)
            return jsonify(load_state_db())
        except ValueError:
            return jsonify({'error': 'Alert not found'}), 404

    alert_id = payload.get('id')
    state = load_state_file()
    alert = next((item for item in state.get('alerts', []) if item.get('id') == alert_id), None)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404

    alert['status'] = 'Resolved'
    alert['resolvedAt'] = payload.get('resolvedAt') or ''
    notification = {
        'id': payload.get('notificationId') or f'NTF-{len(state.get("notifications", [])) + 1}',
        'recipient': 'Supervisor',
        'message': payload.get('notificationMessage', 'Action will be taken immediately'),
        'timestamp': payload.get('timestamp') or '',
        'source': 'Govt Oversight'
    }
    state.setdefault('notifications', []).insert(0, notification)
    save_state_file(state)
    return jsonify(state)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_proxy(path):
    if path != '' and (BASE_DIR / path).exists():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, 'index.html')


if __name__ == '__main__':
    init_database()
    app.run(host='127.0.0.1', port=5000, debug=True)
