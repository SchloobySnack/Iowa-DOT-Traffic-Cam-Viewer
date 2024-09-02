# DOT Traffic Camera Grid

![Preview](img/preview.gif)

This web application displays a grid of live streams from multiple DOT traffic cameras, allowing users to monitor traffic conditions across various locations simultaneously.

## Features

- Displays a grid of traffic camera thumbnails with live video streaming capabilities
- Allows users to filter cameras by region
- Provides sorting options by camera name or region
- Supports playing multiple video streams concurrently
- Uses HLS.js for compatibility with most modern browsers
- Containerized with Docker for easy deployment

## Prerequisites

- Docker installed on your system

## Setup and Running with Docker

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Build the Docker image:
   ```
   docker build -t dot-traffic-cam-app .
   ```
4. Run the Docker container:
   ```
   docker run -d -p 8080:80 dot-traffic-cam-app
   ```
5. Open a web browser and navigate to `http://localhost:8080`

## Usage

1. When you open the application, you'll see a grid of camera thumbnails.
2. Use the "Filter by Region" dropdown to show cameras from a specific region.
3. Click "Sort by Name" or "Sort by Region" to reorder the camera grid.
4. Click the "Play/Pause" button on any thumbnail to start or stop the live video stream.
5. Multiple streams can be played simultaneously.

## Adding More Streams

The application fetches camera data from an API. To add more streams, you would need to update the API endpoint or the data source it's pulling from.

## Project Structure

- `src/index.html`: Main HTML file
- `src/css/styles.css`: CSS styles for the application
- `src/js/app.js`: JavaScript file containing the application logic
- `Dockerfile`: Instructions for building the Docker container
- `nginx.conf`: Nginx server configuration
- `img/preview.gif`: Preview image of the application

## Dependencies

- HLS.js (loaded via CDN)
- Nginx (used in Docker container)

## Notes

- Ensure you have the rights to use and display the traffic camera feeds.
- Playing multiple video streams simultaneously can be resource-intensive. Consider the capabilities of the user's device and network.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions to improve the application are welcome. Please feel free to submit pull requests or open issues to discuss potential enhancements.