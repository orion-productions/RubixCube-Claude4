PROMPT


Hello!

Any comment on my configuration?
I am on Pro, right?
Today we're going to do vibe coding in Cursor for a 3D video game web application that we will first test locally, and then deploy to a public url using github. 
I have activated Agent, and I want to use GPT5... is it the best setting?



I would like to use Cursor and GitHub copilot to vibe code a 3D app with you today.
The game to be able to run in a web browser... for people to be able to play it from a public website hosted by Github.The GitHub profile is orion-productions and the repository name in that profile is RubixCube-like. The project will actually be stored in that repository.


Write a complete HTML/JavaScript program using Three.js that renders a fully interactive Rubik's Cube of any size up to 20x20x20. The user should be able to specify the cube size dynamically (e.g., via an input or a variable), and the cube should be constructed accordingly with proper color-coded faces (standard Rubik's Cube colors: white, yellow, red, orange, blue, green).
Have a button to shuffle the cube (by starting from a solved state, and randomly rotating various parts of the cube about 100 times). 
Include Camera controls for rotating the view, and allow for basic user interaction such as rotating layers of the cube via mouse or UI buttons  or game controller.
Additionally, implement a "solve" button that - when clicked - animates the cube being solved step-by-step visually. You can use a simplified solving algorithm (you do not need to match real Rubik's solving logic but it is preferred that it matches) - the goal is just to animate the cube returning to its original solved state, one move at a time, with clear transitions.
Use Three.js for all rendering.

can you launch a local server so I can test it?