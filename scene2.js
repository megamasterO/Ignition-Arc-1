

// these are my global variables that can be used in html doc as well
var canvas, stage, loader, exportRoot, anim_container, dom_overlay_container, fnStartAnimation, atlas;

function init() {
    
    //preloader script
    atlas = {};
    canvas = document.getElementById('myCanvas');
    // stageGL could be used for webGL but there's more things to do with caching
    stage = new createjs.Stage(canvas);

    //setting a clock that updates stage and allows for animation
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = 30;
    createjs.Ticker.addEventListener("tick", stage);

    //the following comes from createjs preloader
    //https://createjs.com/docs/preloadjs/modules/PreloadJS.html

    loader = new createjs.LoadQueue(false);
    loader.installPlugin(createjs.Sound);
    loader.addEventListener("complete", handleComplete);
    //manually creating the manifest for now to make sure it works
    let manifest = [
        { src: "images/scene3_atlas_1.png", id: "scene3_atlas_1" },
        { src: "images/School_Intro_0010.jpg", id: "bg0" },
        { src: "images/School_Intro_0001.jpg", id: "bg1" },
        { src: "images/School_Intro_0002.jpg", id: "bg2" },
        { src: "images/School_Intro_0003.jpg", id: "bg3" },
        { src: "images/School_Intro_0004.jpg", id: "bg4" },
        { src: "images/classroomcolor.png", id: "bgimage" },
        { src: "images/textbox2.png", id: "textbox" },
        { src: "images/elijah.png", id: "elijah" },
        { src: "images/teacher2.png", id: "teacher" },
        { src: "images/blackKnight.png", id: "knight" },
        { src: "sounds/sarahStudy2.mp3", id: "bgmusic" },
        { src: "sounds/typewritersound.mp3", id: "typewriter"}
    ];
    loader.loadManifest(manifest);
}

//The following function runs when loader event is complete
function handleComplete(event) {
    //once loading of assets is complete I need to run through an initiate function
    //add background to scene first
    var startingBackground = new createjs.Bitmap(loader.getResult("bg0"));
    stage.addChild(startingBackground);

    var knight = new createjs.Bitmap(loader.getResult("knight"));
    knight.transformMatrix = new createjs.Matrix2D();
    // appendTransform ( x,  y,  scaleX,  scaleY,  rotation,  skewX,  skewY,  regX,  regY );
    //was the following:
    //knight.transformMatrix.appendTransform(480, 0, -1, 1, 0, 0, 0, 0, 0);
    knight.transformMatrix.appendTransform(0, 0, -1, 1, 0, 0, 0, 0, 0);
    knight.alpha = 0;
    //could set the transform matrix manually but not good for code readibility
    // elijah.transformMatrix.tx = -350;
    // elijah.transformMatrix.ty = 0;
    stage.addChild(knight);

    function generateCharacter(name, 
                                x, y,  
                                scaleX, scaleY,  
                                rotation,  
                                skewX, skewY,  
                                regX, regY)
    {
        let char = new createjs.Bitmap(loader.getResult(name));
        char.transformMatrix = new createjs.Matrix2D();
        char.transformMatrix.appendTransform(x, y, scaleX, scaleY, rotation, 
            skewX, skewY, regX, regY);
        //need to remove addchild later
        //stage.addChild(char);
        return {
            bitmap: char,
            mask: generateMask(char)
        };
    }

    //object.assign is creating a copy 
    Object.assign(atlas, {
        'textbox': {
            default: generateCharacter("textbox", 0,324, 1, 1, 0, 0, 0, 0, 0),
        },
        'elijah': {
            default: generateCharacter("elijah", -350, 0, 1, 1, 0, 0, 0, 0, 0),
            //surprised: generateCharacter("surprised", 1250, 0, -1, ....);
        },
        'teacher': {
            default: generateCharacter("teacher", 1250, 0, -1, 1, 0, 0, 0),
        },
        'knight': {
            default: {
                bitmap: knight,
                mask: generateMask(knight),
            }
        },
        'bgimage': {
            default: generateCharacter("bgimage", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
        'bg0': {
            default: generateCharacter("bg0", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
        'bg1': {
            default: generateCharacter("bg1", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
        'bg2': {
            default: generateCharacter("bg2", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
        'bg3': {
            default: generateCharacter("bg3", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
        'bg4': {
            default: generateCharacter("bg4", 0, 0, 1, 1, 0, 0, 0, 0, 0),
        },
    })

    //run through all functions to create the scene
    initializeScene();

}

//this function will generate a mask for whatever parameter you pass in
//This is done in my movieclips variable
function generateMask(character) {
    //get loaded image from queue
    let mask = new createjs.Bitmap(character.image);

    mask.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 0, 0)];
    mask.transformMatrix = character.transformMatrix;
    mask.cache(0, 0, mask.image.width, mask.image.height);

    //console.log("mask transformMatrix :", mask.transformMatrix);
    //will be 0 but currently using 0.5 to test if this code works
    mask.alpha = 0;
    //character.parent.addChild(mask); //character.parent refers to stage object
    return mask;

}



function playMusic() {
    var bgmusic = createjs.Sound.play("bgmusic", { loop: -1 });
    bgmusic.volume = 0.5;
    removeEventListener("click", playMusic);
}

function initializeScene() {    
    //changing from loading to click here
    const gifwrapper = document.querySelector(".gif-wrapper");
    // console.log(gifwrapper);
    gifwrapper.classList.add("gif-hidden");

    gifwrapper.addEventListener("transitionend", () => {
        gifwrapper.remove();
        document.getElementById("text-wrapper").style.opacity = 1;

    })

    const element = document.getElementById("text-wrapper");
    element.addEventListener("click", fadeout);
}

//instead of using "event" within the parentheses we could use anything. Ex: "e"
//use "currentTarget" to always get the parent div "text-wrapper" even if
function fadeout(event) {
    var textw = event.currentTarget;
    event.target.removeEventListener("click", fadeout);
    //textw represents text-wrapper
    //event.target is html element that triggers the event
    //by default it will use what called the function (fadeout in this case)
    
    // console.log("🚀 ~ file: canvas.js:129 ~ fadeout ~ event.target:", event.target);
    playMusic();
    const clickhereget = document.querySelector(".clickhere");

    //remove all divs that I don't need
    clickhereget.addEventListener("transitionend", function tnhandler(event) {
        if (event.propertyName === "opacity") {
            textw?.remove();
            clickhereget.removeEventListener("transitionend", tnhandler);
            //*Change out the following for whatever 2 characters are being drawn to the screen first
            scriptReader();
        }
    });
    clickhereget.classList.add("textloaded");
    textw.classList.add("text-wrapper-transition");
}

//will change elijah to character1 and character2. These will be the 2 characters that need to be initialized
// function beginScene(character1, character2) {
//     //set alpha of mask to 0.5
//     character1.default.mask.alpha = 0.5;
//     character2.default.mask.alpha = 0.5;
//     //tween characters into position
//     createjs.Tween.get(character1.default.bitmap.transformMatrix, { loop: false }).to({ tx: -100 }, 2000, createjs.Ease.getPowInOut(4));
//     createjs.Tween.get(character2.default.bitmap.transformMatrix, { loop: false }).to({ tx: 950 }, 2000, createjs.Ease.getPowInOut(4));
//     //text for clicking to begin the scene
//     var textBegin = new createjs.Text('Click', '18px "Lucida Sans Typewriter", "Lucida Typewriter", "monospace"');
//     textBegin.name = "textBegin";
//     textBegin.lineHeight = 27;
//     textBegin.lineWidth = 376;
//     textBegin.setTransform(427, 345.1);
//     stage.addChild(textBegin);
//     // return textBegin
//     addEventListener("click", scriptReader);
// }

function scriptReader() {
    removeEventListener("click", scriptReader);
    //stage.removeChild(stage.getChildByName("textBegin"));
    //setup text block font and location and add it to the stage
    //This textblock is the dynamic textblock where the actual script will be written
    var rpgText = new createjs.Text("", '14px "Lucida Sans Typewriter", "Lucida Typewriter", "monospace"');
    rpgText.name = "rpgText";
    rpgText.lineHeight = 27;
    rpgText.lineWidth = 350;
    rpgText.setTransform(250, 345.1);

    //text to say click to progress
    let textBegin = new createjs.Text('Click', '18px "Lucida Sans Typewriter", "Lucida Typewriter", "monospace"');
    textBegin.name = "textBegin";
    textBegin.lineHeight = 27;
    textBegin.lineWidth = 376;
    textBegin.setTransform(427, 345.1);

    //making the checks for each event being complete
    //at the start of the scene all of the events will be complete and thus true
    let isTextComplete = true;
    let isGifComplete = true;
    let isTweenComplete = true;
    
    //Setting up my character variables so they are easy to call later
    var elijah = atlas.elijah;
    var teacher = atlas.teacher;
    var knight = atlas.knight;

    //var characters = [[elijah, elijah.default.mask], [teacher, teacher.default.mask], [knight, knight.default.mask],];
    
    /**
     * starting conditions for screenLayers - All starting characters will be drawn to screen without user click
     * Max slots will be 4 (Front_1, Front_2, Back_1, Back_2)
     * 
     */
    /**
     * The screen is organized along the x-axis and the z-axis for
     * positioning characters
     * This sets the initial values but they can be 
     */
    let screenLayers = {
        Front_1: {
            char: elijah, //top-levl object holding all emotions
            emotion: "default", //tells us which emotion we are dealing with
            mask: elijah.default.mask //retrieves the mask value
        },
        Front_2: {
            char: teacher,
            emotion: "default",
            mask: teacher.default.mask
        },
        Back_1: {

        },
        Back_2: {

        }
    }

    //before calling changeEmotion function would need to update emotion in screenLayerPos
    //these strings would come from my actual script
    //screenLayerPos = "Front_1";
    //emotion = "surprised";
    function changeEmotion(screenLayers, screenLayerPos, newEmotion){
        let pos = screenLayers[screenLayerPos];
        let character = pos.char;

        //remove existing character
        let bIdx = stage.getChildIndex(character[pos.emotion].bitmap);
        let mIdx = stage.getChildIndex(character[pos.emotion].mask);

        //sets new character and emotion
        pos.emotion = newEmotion;
        pos.bitmap = character[emotion].bitmap;
        pos.mask = character[emotion].mask;

        stage.children[bIdx] = pos.bitmap;
        stage.children[mIdx] = pos.mask;
        stage.update();
    }

    function enterOne(speaker) {
        //first see what's at Front_1 if anything
        //make an if statement (if Front_1 object is empty or not)
        //if empty populate it with speaker
        //get index from child existing on stage
        //replace child at that index with new speaker (speaker that would be sent in as the argument)
        isTweenComplete = false;
        let mask = speaker.default.mask;
        let bitmap = speaker.default.bitmap;
        stage.children.push(bitmap, mask);
        bitmap.alpha = 1;
        mask.alpha = 0.5;
        bitmap.transformMatrix.appendTransform(-300, 0, 1, 1, 0, 0, 0, 0, 0);
        mask.transformMatrix.appendTransform(-100, 0, 1, 1, 0, 0, 0, 0, 0);
        createjs.Tween.get(bitmap.transformMatrix, { loop: false , override:true})
            .to({ tx: -100 }, 500, createjs.Ease.getPowInOut(4))
            .addEventListener("complete", setOnComplete);
    }

    function enterTwo(speaker) {
        isTweenComplete = false;
        let mask = speaker.default.mask;
        let bitmap = speaker.default.bitmap;
        stage.children.push(bitmap, mask);
        bitmap.alpha = 1;
        mask.alpha = 0.5;
        console.log("mask:", mask)
        bitmap.transformMatrix.appendTransform(-1250, 0, 1, 1, 0, 0, 0, 0, 0);
        mask.transformMatrix.appendTransform(950, 0, 1, 1, 0, 0, 0, 0, 0);
        createjs.Tween.get(bitmap.transformMatrix, { loop: false , override:true})
            .to({ tx: 950 }, 500, createjs.Ease.getPowInOut(4))
            .addEventListener("complete", setOnComplete);
            
    }

    function enterThree(speaker) {
        isTweenComplete = false;
        let mask = speaker.default.mask;
        let bitmap = speaker.default.bitmap;
        //should be behind textbot but in front of background
        //Therefore [1] index is the 2nd spot
        let spliceIdx = 1;
        stage.addChildAt(bitmap, mask, spliceIdx);
        bitmap.alpha = 1;
        mask.alpha = 0.5;
        console.log("speaker:", speaker)
        bitmap.transformMatrix.appendTransform(-300, 0, 1, 1, 0, 0, 0, 0, 0);
        mask.transformMatrix.appendTransform(177, 0, 1, 1, 0, 0, 0, 0, 0);
        createjs.Tween.get(bitmap.transformMatrix, { loop: false , override:true})
            .to({ tx: 177 }, 500, createjs.Ease.getPowInOut(4))
            .addEventListener("complete", setOnComplete);
    }
    function enterFour(speaker) {
        isTweenComplete = false;
        let mask = speaker.default.mask;
        let bitmap = speaker.default.bitmap;
        let spliceIdx = 1;
        stage.addChildAt(bitmap, mask, spliceIdx);
        bitmap.alpha = 1;
        mask.alpha = 0;
        console.log("speaker:", speaker)
        bitmap.transformMatrix.appendTransform(727, 0, 1, 1, 0, 0, 0, 0, 0);
        mask.transformMatrix.appendTransform(677, 0, 1, 1, 0, 0, 0, 0, 0);
        createjs.Tween.get(bitmap.transformMatrix, { loop: false , override:true})
            .to({ tx: 677 }, 500, createjs.Ease.getPowInOut(4))
            .addEventListener("complete", setOnComplete);
     
    }

    //this initializes the characters to the screen
    function renderToScreen(screenLayers) {
        //whatever is added to the stage first will be rendered in the back
        //textbox
        stage.addChild(atlas.textbox.default.bitmap);
        atlas.textbox.default.bitmap.alpha = 0;
        isTweenComplete = false;
        createjs.Tween.get(atlas.textbox.default.bitmap, { loop: false , override:true})
            .to({ alpha: 0.8 }, 500)
            .addEventListener("complete", setOnComplete);
        //add dynamic text
        stage.addChild(rpgText);
        //initiate beginning characters
        // let speaker1 = screenLayers.Front_1.char;
        // enterOne(speaker1);
        //text for clicking to begin the scene
        stage.addChild(textBegin);
        addEventListener("click", nextTextBlock);
    }

    renderToScreen(screenLayers);

    let s = "exit-Front_1";
    let [action, position] = s.split("-");

    //[character,"emotion","dialogue","action","background"],
    var textBlocks = [
        [elijah,"",            "*sigh* (...another day...)","enter1","bg0"],
        [elijah,"",            "(...school is a glorified prison...)",,],
        [elijah,"",            "(...you don't choose what you eat...)",,"bg1"],
        [elijah,"",            "(...you only get limited time outside...)",,"bg2"],
        [elijah,"",            "(...And if you don't follow the rules...",,"bg3"],
        [elijah,"",            "you are punished...)",,"bg4"],
        [elijah,"",            " ",,"gif1"],
        [elijah,"",            "(...when will this torture end...)",,"bgimage"],
        [elijah,"",            "*students eyes are glazed over*",,],
        [elijah,"",            "(...since everyday's a drag...",,],
        [elijah,"",            "someone needs to make this more interesting...)",,],
        [elijah,"",            "(...and I know just the thing!...)",,],
        [teacher,"",           "So by the late 1800s, the Second Industrial Revolution was in full swing","enter2",],
        [teacher,"",           "technology touched every part of our daily lives, and every corner of the world",,],
        [teacher,"",           "Productions of goods such as refrigerators, automobiles, and of course fan favorite, television sets, all increased dramatically due to advancing machines",,],
        [teacher,"",           "This dropped prices and we experienced the most wealth and prosperity among the rich and poor",,],
        [teacher,"",           "And now we are at the cutting edge of atomic energy!",,],
        [elijah,"",            " ",,"gif2"],
        [teacher,"",           "*teacher turns around*",,],
        [elijah,"",            "*Elijah gets up after her*",,],
        [teacher,"",           "Machines give us control, order, and progress as a civilized nation",,],
        [knight,"",           "*a student chuckles",,],
        [knight,"",           "*another student catches on*",,],
        [teacher,"",           "really we wouldn't be ANYWHERE",,],
        [teacher,"",           "       WITHOUT",,],
        [teacher,"",           " ",,"gif3"],
        // [teacher,"",           "...     TECHNOLOGY!!",],
        // [knight,"",            "*kids burst out laughing as Elijah mimics Mudi's exaggerated pose",],
        [teacher,"",           "Hm? What'ss sooooo funnEYH??",,],
        [teacher,"",           "*turns around and sees Elijah in a mimicked pose*",,],
        [teacher,"",           "Elijah! Take your seat NOW young man!!",,],
        [teacher,"",           "Being a sssnivelling brat like you won't get you anywhere in life",,],
        [teacher,"",           "Were you even paying attention??",,],
        [elijah,"",            "Yeah, apparently if I don't succeed here, I'll never become an amazing teacher...",,],
        [elijah,"",            "that yells at brats for a living",,],
        [teacher,"",           "OK S-M-A-R-T-Y PANTS",,],
        [teacher,"",           "I'll have you know that being a teacher is no easy job",,],
        [teacher,"",           "Everyone may take it lightly",,],
        [teacher,"",           "but education is the unsung hero of this country",,],
        [teacher,"",           "And maybe if you weren't so preoccupied causing chaos every 2 seconds ",,],
        [teacher,"",           "you could see the difference a teacher makes and actually pass a test young man",,],
        [knight,"",            "*Class goes OOOooooooOOOooo*",,],
        [elijah,"",            "*Elijah is visibly shocked. Then fights back anger*",,],
        [elijah,"",            "Well maybe if you weren't so BUSY rambling...",,],
        [elijah,"",            "*calms down slightly*",,],
        [elijah,"",            "You'd notice if a student was paying attention or...",,],
        [elijah,"",            "*smirks*",,],
        //visual cut to prank playing out
        [knight,"",            " ",,"gif4"],
        [teacher,"",           "AAIIEIEEEEEE Get it off",,],
        [teacher,"",           "Get...it...OFF!!",,],
        [teacher,"",           "ELIJAH! OFFICE! NOW!!!!",,],
        [elijah,"",            "Fine! It's better than being here!",,],
        [elijah,"",            "-heh plus I'm right in time for my BIG plan-",,],
        [elijah,"",            " ","exit",],
        [teacher,"",           "NOW, anyone ELSE want to act up??",,],
        [knight,"",            "Nooo Ms. Mudi. Please don't lump us in with Elijah.",,],
        [teacher,"",           "Good. Now where was I ...",,],
        [teacher,"",           "click to restart","exit",],

    ];

    //using constants because Speaker will always be in the first index. Text will be 2nd
    const SPEAKER = 0;
    const EMOTION = 1;
    const TEXT = 2;
    const ACTION = 3;
    const BACKGROUND = 4;
    //defining variables that will be used within my text functions
    var currentTextBlockIndex = 0; //starting the index off at 0
    var currentTextBlockString;
    var currentTextBlock;

 

    function setOnComplete() {
        isTweenComplete = true;
    }

    

    // function startGif(id, url) {
    //     var x = 0;
    //     var y = 0;
    //     var effect = document.createElement("IMG");
    //     effect.style.src="https://ignition.thecomicseries.com/files/scenes/storyboardexport.gif";
    //     effect.style.width="75px";
    //     effect.style.height="75px";
    //     effect.style.zIndex="2000";
    //     effect.style.position="fixed";
    //     effect.style.top=y;
    //     effect.style.left=x;
    //     console.log("effect:", effect);
    //     ele.appendChild(effect);
    //     setTimeout(function(){ele.removeChild(effect);},1700);
    // }
    const anim = 'anim';

    function startGif(id, url, duration) {
        var img = document.getElementById(id);
        img.src = "";
        img.src = url;
        setTimeout(function()
        {
            img.src = "";
            isGifComplete = true;
            nextTextBlock();
        },duration);
      }
    
    function nextTextBlock() {
        console.log("🚀 ~ scriptReader ~ isTextComplete:", isTextComplete);
        console.log("🚀 ~ scriptReader ~ isGifComplete:", isGifComplete);
        console.log("🚀 ~ scriptReader ~ isTweenComplete:", isTweenComplete);
        if (isTextComplete !== true || isGifComplete !== true || isTweenComplete !== true) {
            return;
        }
        stage.removeChild(textBegin);
        
        console.log("nextTextBlock() was called: ", currentTextBlockIndex);
        //The following piece of code just makes it easier to refer to speaker
        let speaker = textBlocks[currentTextBlockIndex][SPEAKER];
        let emotion = textBlocks[currentTextBlockIndex][EMOTION] || speaker.id;
        let action = textBlocks[currentTextBlockIndex][ACTION];
        let background = textBlocks[currentTextBlockIndex][BACKGROUND];
        //current method requires the asset to be drawn to screen. Previously I made a blank frame on each movieclip
        //call character and emotion with this code
        console.log("current speaker: ", textBlocks[currentTextBlockIndex][SPEAKER]);
        console.log("current emotion: ", textBlocks[currentTextBlockIndex][EMOTION]);

        function removeOnComplete() {
            isTweenComplete = true;
            stage.removeChild(speaker.default.mask);
            stage.removeChild(speaker.default.bitmap);
        }

        //Set the emotion to be displayed
        // if (emotion != undefined){
        //         speaker.gotoAndStop(emotion);

        //         //characters = [ chrArray = [torin, disgusted], [] ]
        //         //HERE IS WHERE I REMOVE THE PREVIOUS MASK FROM ARRAY AND ADD IN THE NEW ONE
        //         for(let chrArray of characters){

        //             if(chrArray[0] === speaker){
        //                 //set the 2nd slot [torin, mask] as the new mask the function calls
        //                 //it should replace
        //                 //set previous filter alpha to zero before replaceing with the new in the array
        //                 console.log("chrArray[1]: ", chrArray[1]);
        //                 chrArray[1].alpha=0;
        //                 chrArray[1] = getMask(speaker, emotion);
        //                 console.log("check for filter change: ", characters);


        //                 break;
        //             }
        //         }

        //     }
        //set the position
        if (action != undefined && action == "swap1") {
            var mask = getMask(speaker, emotion);
            moveToFront(mask);
            moveToFront(speaker);
            speaker.transformMatrix.appendTransform(0, 0, 1, 1, 0, 0, 0, 0, 0);
        }
        else if (action != undefined && action == "swap2") {
            var mask = speaker.mask;
            moveToBack(mask);
            moveToBack(speaker);
            speaker.transformMatrix.appendTransform(177, 0, 1, 1, 0, 0, 0, 0, 0);
        }
        else if (action != undefined && action == "swap3") {
            var mask = getMask(speaker, emotion);
            moveToBack(mask);
            moveToBack(speaker);
            speaker.transformMatrix.appendTransform(250, 0, -1, 1, 0, 0, 0, 427, 0);
        }
        else if (action != undefined && action == "swap4") {
            var mask = getMask(speaker, emotion);
            moveToFront(mask);
            moveToFront(speaker);
            speaker.transformMatrix.appendTransform(427, 0, -1, 1, 0, 0, 0, 427, 0);
        }

        //ENTER	
        else if (action != undefined && action == "enter1") {
            enterOne(speaker);
        }
        else if (action != undefined && action == "enter2") {
            enterTwo(speaker);
        }
        else if (action != undefined && action == "enter3") {
            enterThree(speaker);
        }
        else if (action != undefined && action == "enter4") {
            enterFour(speaker);
        }

        //EXIT	
        else if (action != undefined && action == "exit") {
            isTweenComplete = false;
            createjs.Tween.get(speaker.default.bitmap, { loop: false , override:true})
                .to({ alpha: 0 }, 1000)
                .addEventListener("complete", removeOnComplete);
            // createjs.Tween.get(speaker.default.mask, { loop: false , override:true})
            //     .to({ alpha: 0 }, 1000)
            //     .addEventListener("complete", removeOnComplete);
        }


        //PLAYING GIFS
        if (background != undefined && background == "gif1") {
            isGifComplete = false;
            removeEventListener("click", nextTextBlock);
            //only need to replace url and duration for any new clips
            url = 'images/test0.gif';
            duration = 4500;
            //anim parameter grabs the string 'anim' which match the image div that gif will be written to
            //anim is defined higher in this document
            //set url right above that we will use and pass through
            startGif(anim, url, duration);
        }

        else if (background != undefined && background == "gif2") {
            isGifComplete = false;
            removeEventListener("click", nextTextBlock);
            //only need to replace url and duration for any new clips
            url = 'images/test2.gif';
            duration = 3500;
            //anim parameter grabs the string 'anim' which match the image div that gif will be written to
            //anim is defined higher in this document
            //set url right above that we will use and pass through
            startGif(anim, url, duration);
        }

        else if (background != undefined && background == "gif3") {
            isGifComplete = false;
            removeEventListener("click", nextTextBlock);
            //only need to replace url and duration for any new clips
            url = 'images/test4.gif';
            duration = 5500;
            //anim parameter grabs the string 'anim' which match the image div that gif will be written to
            //set url right above that we will use and pass through
            startGif(anim, url, duration);
        }

        else if (background != undefined && background == "gif4") {
            isGifComplete = false;
            removeEventListener("click", nextTextBlock);
            //only need to replace url and duration for any new clips
            url = 'images/test5.gif';
            duration = 2500;
            //anim parameter grabs the string 'anim' which match the image div that gif will be written to
            //set url right above that we will use and pass through
            startGif(anim, url, duration);
        }

        //CHANGING OUT BACKGROUNDS
        else if (background != undefined && background == "bgimage") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bgimage.default.bitmap, spliceIdx);
        }
        else if (background != undefined && background == "bg0") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bg0.default.bitmap, spliceIdx);
        }

        else if (background != undefined && background == "bg1") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bg1.default.bitmap, spliceIdx);
        }

        else if (background != undefined && background == "bg2") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bg2.default.bitmap, spliceIdx);
        }

        else if (background != undefined && background == "bg3") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bg3.default.bitmap, spliceIdx);
        }

        else if (background != undefined && background == "bg4") {
            let spliceIdx = 0;
            stage.removeChildAt(spliceIdx);
            stage.addChildAt(atlas.bg4.default.bitmap, spliceIdx);
        }
        
        
        //DIMMING
        // console.log("🚀 Object.keys(screenLayers):", Object.keys(screenLayers));
        // console.log("speaker:", speaker);
        //https://www.youtube.com/watch?v=tVq4L8tnWuA
        //are 2:40 is where it was helpful
        for (const key of Object.keys(screenLayers)) {
            // console.log("🚀screenLayers[key].char:", screenLayers[key].char);
            // console.log("🚀screenLayers[key].mask:", screenLayers[key].mask);
            if (screenLayers[key].char != undefined && screenLayers[key].char != speaker) {  
                createjs.Tween.get(screenLayers[key].mask, { loop: false }).to({ alpha: 0.5 }, 500, createjs.Ease.getPowInOut(4));
            }
            else if (screenLayers[key].char != undefined && screenLayers[key].char === speaker) {
                createjs.Tween.get(screenLayers[key].mask, { loop: false }).to({ alpha: 0 }, 500, createjs.Ease.getPowInOut(4));
            }
        }
        //end of dimming and higlighting


        //This is where we were work with the dynamic text box
        currentTextBlock = textBlocks[currentTextBlockIndex][TEXT]; // set the textj

        if (currentTextBlock == undefined) return;

        var idx = 0;
        var string = "";
        //create timer to print text letter by letter
        var isPlaying = null;
        //this number sets the speed
        var timerFunctionReference = setInterval(letterByLetter, 10);
        
        function letterByLetter() {
            string += currentTextBlock[idx++];

            //the percent sign is taking the remainder of what idx divided by 3 is
            //the number after the percentage sign controls how frequent the sound is triggered
            if (idx % 7 === 0) {
                var typewriter = createjs.Sound.play("typewriter");
                typewriter.volume = 0.5;
            }


            if (string.length > 0) removeEventListener("click", nextTextBlock);
            if (idx >= currentTextBlock.length) {
                clearInterval(timerFunctionReference);
                addEventListener("click", nextTextBlock);
            }
            
            // console.log(string);
            updateText(string);
        }
        console.log(currentTextBlock)

        currentTextBlockIndex++; //increases the index by 1
        if (currentTextBlockIndex >= textBlocks.length) {
            currentTextBlockIndex = 0;
        }
         
        return currentTextBlock;
    }
    

    //needed to change this.rpgText -> rpgText		
    rt = rpgText;
    function updateText(msg) {
        rt.text = msg;
    }
}