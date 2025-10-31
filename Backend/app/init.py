from flask import Flask
from flask_cors import CORS
from app.config import Config
from integrations.adk_client import warmup

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    from adapters.routes import bp
    app.register_blueprint(bp)

    try:
        warmup()
    except Exception:
        pass

    return app