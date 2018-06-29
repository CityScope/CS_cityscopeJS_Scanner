# CityScopeJS Setup

#### Before starting

watch this intro video to get to know how CityScopeJS is making the world a better place:

[![](http://img.youtube.com/vi/Z7v2clIaTKY/0.jpg)](http://www.youtube.com/watch?v=Z7v2clIaTKY "CityScopeJS | Intro & Setup")

#### Running

- [Click here to run CityScopeJS](https://cityscope.github.io/CS_citysc…)
- It should run from any modern browser with HTML5 support. Tested on Raspberry pi 2, Android and IPhone Yes, IE7 on Windows XP might not work.
- Clone is not necessary but please do clone and run locally before posting `issues`.

#### Setup

At first run, follow these instructions:

- Table and LEGO bricks settings are under `data` folder in `json` format.
- Load `json` file using the UI file browser. File should follow settings described here:
  https://github.com/CityScope/CS_CityIO_Backend/wiki
- For advanced creation of binary [0,1 x 16] permutations, us python script in: `/Py_BinaryPermutations/py_bin.py`
- upon successful loading of settings file the mouse will turn to a magnifying glass prompting key stone of the table image/video
- select the top left, top right, bottom left and bottom right corners of the image (in that order)
- check https://cityio.media.mit.edu/api or under `cityIO` UI folder to see the results

#### Edit `YourSettings.JSON`

- open for editing your JSON file
- change the gridSize to the size you need in `ncol` property
- If necessary, change the recognized patterns. To do this you need to edit the `codes` array in the `JSON` file.
- The codes represent white by 1 and black by 0.
- If you only have lego pieces that are 2x2, then you will need to use codes that are in blocks of 4. eg. a pattern with 4 white dots in the top-left corner and the rest black would be [1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0].
- When you get the 1x1 lego pieces, you can use more complicated patterns.

#### Local Clone and Run using GH desktop

- Open Github Desktop
- Click the ‘+’ icon for adding a new repository
- Under ‘Clone’, search for `cityscopeJS` and select it
- Run a local server:
- navigate to the `cityscopeJS` folder on your local and run a local server
- open your web browser and go to http://localhost:8000/index.html
- you should see the web tool in your browser
- Experiment with scanning using webcam
