from app import app
for rule in app.url_map.iter_rules():
    print(rule)
