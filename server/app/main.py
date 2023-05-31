from flask import Flask, redirect, render_template
import firebase_admin
from firebase_admin import db
import os

# Initialising firebase
cred_obj = firebase_admin.credentials.Certificate('./ServiceAccountKey.json')
default_app = firebase_admin.initialize_app(cred_obj, {'databaseURL': 'https://link-chopper-default-rtdb.firebaseio.com/'})
# Initializing Flass app
app = Flask(__name__, static_folder='./dist/assets', template_folder='./dist')
# Configuring home route
@app.route('/')
def hello_world():
    return redirect('/app')

@app.route('/app')
def homepage():
    return render_template('index.html')

# Redirecting the user
# 1. Grab the generated_key from the path
# 2. Check if the key has a longURL assosiated with it
# 3. Redirect the user if the key exists
# 4. Return 404 if the key doesnt exist
@app.route('/<path:generated_key>', methods=['GET'])
def fetch_from_firebase(generated_key):
    ref = db.reference(f'/{generated_key}')
    data = ref.get()
    if data:
        longURL = data['longURL']
        return redirect(longURL)
    else:
        # CREATE A 404 PAGE
        return '404 not found'
