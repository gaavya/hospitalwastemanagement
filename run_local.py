import app


if __name__ == "__main__":
    app.init_database()
    app.app.run(host="127.0.0.1", port=5000, debug=False)
