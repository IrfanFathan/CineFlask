# Home Media Server 🎥

A modern, Netflix-inspired media server built with Flask to organize and stream your movie collection at home. 🏠✨

## Features

- 🎬 **Modern UI**: Netflix-like interface with a responsive design.
- 🔍 **Search Functionality**: Quickly find movies by title or genre.
- 📂 **Database Integration**: Store and manage movie details (SQLite).
- 🎥 **Video Streaming**: Stream movies directly in the browser.
- 📊 **Filter Options**: Sort movies by genre or other metadata.
- 📱 **Mobile-Friendly**: Enjoy on any device, optimized for smaller screens.

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Styling**: Tailwind CSS / Bootstrap

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IrfanFathan/home-media-server.git
   cd home-media-server
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database and add your movie collection:
   ```bash
   python init_db.py
   ```
4. Run the server:
   ```bash
   python app.py
   ```
5. Access your media server at `http://127.0.0.1:5000`.

## Project Structure

```
media_server/
├── app.py              # Main Flask application
├── init_db.py          # Script to initialize the database
├── templates/          # HTML templates
│   ├── base.html       # Base layout template
│   ├── index.html      # Home page template
│   ├── movie.html      # Movie playback template
├── static/             # Static assets
│   ├── css/            # CSS files
│   │   └── style.css   # Custom styling
│   ├── posters/        # Movie posters
│   └── movies/         # Movie files
├── database.db         # SQLite database
├── requirements.txt    # Python dependencies
```

## Screenshots

### Home Page
![Home Page Screenshot](static/screenshots/home_page.png)

### Movie Details and Playback
![Movie Playback Screenshot](static/screenshots/movie_page.png)

## Future Improvements

- **User Authentication**: Personalized movie recommendations.
- **Advanced Filters**: Filter movies by year, rating, etc.
- **Dynamic Movie Loading**: Automatically detect new movies added to the directory.
- **Streaming Optimization**: Chunked video loading for better performance.

## Contributions

Contributions and suggestions are welcome! 😊

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a pull request.

---

Feel free to create issues or submit pull requests. Let's build something amazing together!
