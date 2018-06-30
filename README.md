# CityScopeJS

##### also favorably known as ©® TactileScopeMatrixCityLEGOtizer ©®

![](docs/csjs.jpg)

CityScopeJS is a rapid prototyping urban modeling and simulation platform aimed at making MIT CityScope project accessible though the ubiquity of web-enabled devices. CityScopeJS runs entirely in the browser, including CV, projection and spatial analysis.

### features

- web-based, HTML5 + JS without dependencies
- ~65k potential unique permutations ['brick types'] using only black and white optically tagged objects
- Dead easy setup and running
- Table testing and dataviz portal
- 100x100 4x4 LEGO grid scanning & sending to cityIO @40fps and 20x20 @20fps from Pixel 2xl Android phone

#### the real important features

- Vaporware graphics
- Turing Complete
- Turing Prize Winner

---

### Before starting

watch this intro video [also, 80's music] to get to know how CityScopeJS is making the world a better place:

[![](http://img.youtube.com/vi/Z7v2clIaTKY/0.jpg)](http://www.youtube.com/watch?v=Z7v2clIaTKY "CityScopeJS | Intro & Setup")

### Running

[Click here to run CityScopeJS](https://cityscope.github.io/CS_citysc…)

- CityScopeJS should run on any modern browser with HTML5 support. Tested on Raspberry pi 2, Android and IPhone Yes, IE7 on Windows XP might not work.
- Clone is not necessary for common setup but please do clone and run locally before posting `issues`.

### Setup

At first run, follow these instructions:

- Table and LEGO bricks settings are under `data` folder in `json` format.
- Load `json` file using the UI file browser. File should follow settings described here:
  https://github.com/CityScope/CS_CityIO_Backend/wiki
- For advanced creation of binary [0,1 x 16] permutations, us python script in: `/Py_BinaryPermutations/py_bin.py`
- upon successful loading of settings file the mouse will turn to a magnifying glass prompting key stone of the table image/video
- select the top left, top right, bottom left and bottom right corners of the image (in that order)
- check https://cityio.media.mit.edu/api or under `cityIO` UI folder to see the results

#### Editing `_YourSettings.JSON`

- open your JSON [name it at will] file for editing
- change the `gridSize` to the size you need in `ncol` property
- If necessary, change the recognized patterns. To do this you need to edit the `codes` array in the `JSON` file.
- The codes represent white by 1 and black by 0.
- If you only have lego pieces that are 2x2, then you will need to use codes that are in blocks of 4. eg. a pattern with 4 white dots in the top-left corner and the rest black would be `[1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0]`.
- When you get the 1x1 lego pieces, you can use more complicated patterns.

#### Clone and Run using GH desktop

- Open Github Desktop
- Click the ‘+’ icon for adding a new repository
- Under ‘Clone’, search for `cityscopeJS` and select it
- Run a local server:
- navigate to the `cityscopeJS` folder on your local and run a local server
- open your web browser and go to http://localhost:8000/index.html
- you should see the web tool in your browser
- Experiment with scanning using webcam

---

### The true story behind CityScopeJS

CityScopeJS, also favorably known as _©® TactileScopeMatrixCityLEGOtizer ©®_ was invented during a warm, steamy but somehow cold summer night in December, 2013. My friend [Hackerman](https://www.youtube.com/watch?v=KEkrWRHCDQU) and I were riding [Jeremiah](https://www.youtube.com/watch?v=GBlWkNZph0s), our old faithful Trojan horse, across the Mohave dessert.

![Alt Text](https://media.giphy.com/media/oSYflamt3IEjm/giphy.gif)

Since we were both holding on to Jeremiah's saddle, Hackerman was only able to write the code in 0.5 [parsecs](https://en.wikipedia.org/wiki/Parsec "Title"), using his [Nintendo PowerGlove](https://en.wikipedia.org/wiki/Power_Glove); After 6 hours of code-riding, CityScopeJS was developed, tested, QAed by NASA and SpaceX and was ready to [disrupt and make the world a better place.](https://www.youtube.com/watch?v=J-GVd_HLlps)

![Alt Text](https://thumbs.gfycat.com/ReflectingHatefulEidolonhelvum-size_restricted.gif)

The system has since won the Oscars, Turing Prize, 47 pending patents, a book and was featured in nine Bollywood films.

---

using @jlouthan matrix transformations.

#### [Project devs & contributors](https://github.com/CityScope/CS_cityscopeJS/graphs/contributors)
