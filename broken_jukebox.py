from flask import Flask, request, g, redirect, url_for, abort, render_template, send_from_directory, jsonify
from werkzeug import secure_filename
from hashlib import md5
import sqlite3
import os
import time
import random

DEBUG = False
BASE_DIR = '/home/user1/Documents/broken-jukebox/'
UPLOAD_DIR = BASE_DIR + 'tracks'
DATABASE = BASE_DIR + 'broken_jukebox.db'
ALLOWED_EXTENSIONS = set(['m4a', 'mp3', 'ogg', 'wav'])

app = Flask(__name__)
app.config.from_object(__name__)

# Make sure extension is in the ALLOWD_EXTENSIONS set
def check_extension(extension):
	return extension in ALLOWED_EXTENSIONS

def connect_db():
	return sqlite3.connect(app.config['DATABASE'])

# Return a list of the last 25 uploaded tracks
def get_all_tracks():
	cur = g.db.execute('select filename, title from tracks order by id desc')
	tracks = cur.fetchall()
	return tracks

@app.route('/random_track')
def get_random_track():
	cur = g.db.execute('select filename, title from tracks order by id desc')
	tracks = cur.fetchall()
	random_track = random.choice(tracks)
	return jsonify(random_track)

# Insert filename into database	
def add_track(filename, title):
	g.db.execute('insert into tracks (filename, title) values (?, ?)', [filename, title])
	g.db.commit()
	
# Taken from flask example app
@app.before_request
def before_request():
    g.db = connect_db()
    
# Taken from flask example app
@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
        
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/', methods=['GET','POST'])
def upload_track():
	if request.method == 'POST':
		file = request.files['file']
		try:
			extension = file.filename.rsplit('.', 1)[1].lower()
		except IndexError, e:
			abort(404)
		if file and check_extension(extension):
			# Salt and hash the file name
			hash_filename = md5(file.read() + str(round(time.time() * 1000))).hexdigest() + '.' + extension
			file.seek(0) # Move cursor back to beginning so we can write to disk
			file.save(os.path.join(app.config['UPLOAD_DIR'], hash_filename))
			add_track(hash_filename, file.filename)
			return redirect('/')
		else: # Bad file extension
			abort(404)
	else:
		return render_template('base.html', tracks=get_all_tracks())

@app.route('/tracks/<filename>')
def return_track(filename):
	return send_from_directory(app.config['UPLOAD_DIR'], secure_filename(filename))
	
if __name__ == '__main__':
	app.run(debug=DEBUG, host='0.0.0.0')
