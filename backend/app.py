from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    render_template
)
from flask_cors import CORS
import sys
import io

app = Flask(__name__)
CORS(app)

# Serve the React app
@app.route('/')
def serve_react_app():
    return render_template('index.html')


@app.route('/run_code', methods=['POST'])
def run_code():
    try:
        data = request.json
        code = data['data']
        
        # Capture stdout
        old_stdout = sys.stdout
        redirected_output = sys.stdout = io.StringIO()

        # Execute the code
        exec(code)

        # Get the output and restore stdout
        sys.stdout = old_stdout
        output = redirected_output.getvalue()
        
        return jsonify({
            'output': output
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)