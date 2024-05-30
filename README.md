# TabZen 🧘🏽

### The World's Smartest Tab Organizer

TabZen is a cutting-edge browser extension designed to effortlessly organize your tabs. Using advanced vector embeddings and unsupervised clustering, it intelligently predicts and categorizes your tabs based on their content. Enjoy seamless tab management with just a click.

## Getting Started

Follow these instructions to get a local copy of TabZen up and running for development and testing purposes. For deployment details, see the [Deployment](#deployment) section.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en)
- [Python 3.10+](https://www.python.org/)

### Installation

#### Running the Extension Locally

1. **Clone the Repository**

   ```bash
   git clone https://github.com/taimurshaikh/TabZen.git
   ```

2. **Install Python Server Dependencies**

   ```bash
   cd TabZen/server
   pip install -r requirements.txt
   ```

3. **Start the Python Server**

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 80 --reload
   ```

4. **Install Node.js Extension Dependencies**

   ```bash
   cd ../extension
   npm install
   ```

5. **Build the Extension**

   ```bash
   npm run build
   ```

6. **Load the Extension into Your Browser**

   Follow [these instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) to load the unpacked extension. Select the `TabZen/extension/dist` directory.

## Deployment

For deployment, the backend server will be hosted on a cloud provider, and the extension will be published to the Chrome Web Store. To deploy your own backend server, update the API URL in the extension code (default: `http://localhost:80`) to your server's URL.

## Acknowledgments and Resources

- [Chrome for Developers](https://developer.chrome.com/)
