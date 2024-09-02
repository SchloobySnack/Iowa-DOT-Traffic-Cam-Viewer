# DOT Traffic Camera App

This is a web application that displays live streams from multiple DOT traffic cameras, containerized with Docker for easy deployment.

## Features

- Displays live video streams from multiple DOT traffic cameras
- Allows users to select different camera streams from a dropdown menu
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

1. Open the application in a web browser.
2. Use the dropdown menu to select a traffic camera stream.
3. The selected stream will start playing in the video player.

## Adding More Streams

To add more streams, edit the `videoStreams` array in the `src/js/app.js` file. Add new objects with `name` and `url` properties for each new stream.

## Dependencies

- HLS.js (loaded via CDN)
- Nginx (used in Docker container)

## Notes

- Ensure you have the rights to use and display the traffic camera feeds.
- The current stream URLs are examples and may need to be updated with actual DOT camera URLs.

## License

This project is open source and available under the MIT License.