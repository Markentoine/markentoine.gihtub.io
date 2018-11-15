$(function () {
  var APPLES = ['_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8'];
  // DOM elements
  var $openMenu = $('.openMenu');
  var $hamburger = $('#hamburger');
  var $closeMenu = $('.closeMenu');
  var $cross = $('#cross');
  var $menu = $('.menu');
  var $start = $('.start');
  var $restart = $('.restart');
  var $language = $('.language');
  var $alphabet = $('.alphabet');
  var $message = $('.message');
  //
  var currentGame;
  var currentRound;
  var pickAWord;
  var applesCopy = [].slice.call(APPLES);
  var LANGUAGES = {
    _EN: ['banana', 'apple', 'apricot', 'blackcurrant', 'blackberry', 'blueberry', 'cherry',
      'avocado', 'coconut', 'fig', 'grape', 'kiwi', 'lemon', 'lime', 'lychee', 'mango', 'nectarine',
      'orange', 'papaya', 'peach', 'pear', 'pineapple', 'plum', 'raspberry', 'strawberry', 'watermelon'
    ],

    _GE: ['banane', 'apfel', 'aprikose', 'brombeere', 'heidelbeere', 'kirsche', 'avocado', 'kokosnuss',
      'feige', 'traube', 'zitrone', 'limette', 'lychee', 'mango', 'nektarine', 'orange', 'papaya',
      'pfirsich', 'birne', 'ananas', 'pflaume', 'himbeere', 'erdbeere', 'wassermelone',
    ],

    _FR: ['banane', 'pomme', 'abricot', 'cassis', 'mure', 'myrtille', 'cerise', 'avocat', 'figue',
      'raisin', 'citron', 'litchi', 'mangue', 'nectarine', 'orange', 'papaye', 'myrtille',
      'peche', 'poire', 'ananas', 'prune', 'framboise', 'fraise', 'pasteque', 'mandarine', 'griotte', 'groseille'
    ],

    _HU: ['cseresznye', 'banan', 'alma', 'barack', 'ribizli', 'narancs', 'korte', 'szilva', 'eper',
      'dinnye', 'malna', 'citrom'
    ]
  }

  var HEADERS = {
    _EN: 'PICK A FRUIT',
    _GE: 'PFLUCKE EINE FRUCHT',
    _FR: 'CUEILLEZ UN FRUIT',
    _HU: 'VALASSZ EGY GYUMOLCSOT',
  }
  // messages
  var CHOOSE = "CHOOSE A LETTER"
  var ULOOSE = "Harvest is done... You didn't make it...";
  var UWIN = "Well done! You have a new fruit in your basket!";
  var NO_MORE_WORDS = "Sorry, You picked all the fruits!";
  var RESTART = "Please, Restart the game from the menu!";

  var buildPick = function (language) {
    var WORDS = LANGUAGES[language];
    return function pickWord() {
      var randomIndex = Math.floor(Math.random() * (WORDS.length));
      var wordPicked = WORDS.splice(randomIndex, 1);
      return wordPicked[0];
    }
  }

  var randomApple = function randomApple() {
    var randomIndex = Math.floor(Math.random() * applesCopy.length);
    return document.querySelector(`#${applesCopy.splice(randomIndex, 1)[0]}`);
  }

  // ----->> ANIMATIONS <<----- //

  var Animation = {

    appleFall: function (element) {
      //Animates the fall and the roll of the apple
      $(element).css('animation', 'appleRoll 400ms cubic-bezier(.42, -.3, 1, 1)');
      setTimeout(() => {
        $(element).css('top', '561px');
      }, 400);
      setTimeout(() => {
        $(element).children().css('animation', 'deformation 100ms ease-out')
      }, 405);
    },

    treeToAutumn: function () {
      $('#springTree').fadeOut(1000);
      $('#autumTree').fadeIn(800);
    },

    treeToASpring: function () {
      $('#autumTree').fadeOut(400);
      $('#springTree').fadeIn(400);
    },

    lettersRoll: function () {
      document.querySelectorAll('.wordLetter').forEach(letter => {
        $(letter).css('animation', 'shakeLetter 200ms ease-out');
      })
    },
  }
  
  var allLettersGuessed = function () {
    return currentRound.uniqLetters.every(letter => currentRound.lettersGuessed.includes(letter));
  }
  
  var messaging = function (message) {
    $message.text('');
    $message.text(message);
  }
  
  var slideUpMenu = function () {
    $menu.slideUp();
    setTimeout(() => {
      $hamburger.css('transform', '');
      $hamburger.show();
    }, 400);
  }
  
  // ----->> APLHABET EVENTS HANDLING <<----- //
  
  var playGame = function playGame(e) {
    var target = e.target;
    var $target = $(target);
    var targetLetterP = target.className === 'letter';
    var currentChosenLetter = $target.attr('data-id');
    var currentWordLetters = document.querySelectorAll('.wordLetter');
    var neverDoneChoiceP = !currentRound.lettersTried.includes(currentChosenLetter);
    
    if (targetLetterP && neverDoneChoiceP) {
      
      // blur the chosen letter
      $target.css('filter', 'blur(5px)');
      currentRound.lettersTried.push(currentChosenLetter);
      
      if (currentRound.checkGoodGuess(currentChosenLetter)) {
        currentRound.lettersGuessed.push(currentChosenLetter);
        //reveals correct letters in the word
        currentWordLetters.forEach(function (letter) {
          var currentAlphaLetter = $(letter).attr('data-id');
          
          if (currentAlphaLetter === currentChosenLetter) {
            Board.revealLetter(letter);
          }
        });
        
        if (allLettersGuessed()) {
          messaging(UWIN);
          currentGame.addFruitBasket();
          Board.addFruitBasket();
          Animation.lettersRoll();
          $alphabet.off('click');
        }
        // an apple falls if the guess is not right
      } else {
        var fallingApple = randomApple();
        
        if (fallingApple && applesCopy.length >= 1) {
          Animation.appleFall(fallingApple);
        } else {
          Animation.appleFall(fallingApple);
          Animation.treeToAutumn();
          messaging(ULOOSE);
          Board.revealAllLetters(currentWordLetters, 'red');
          $alphabet.off('click');
        }
      }
    }
  }
  
  var setUpNewRound = function () {
    currentRound = Round(pickAWord());
    if (currentRound) {
      currentRound.play();
    } else {
      messaging(NO_MORE_WORDS);
      setTimeout(() => {
        messaging(RESTART);
      }, 1000);
    }
  }
  
  // MAIN OBJECTS //
  
  var Board = {

    revealLetter: function reveaLetter(letter, color = 'green') {
      //deblur the letter
      $(letter).css({
        'transition': 'filter 200ms ease',
        'filter': ''
      });
      // change the border
      $(letter).parent().css({
        'border': '3px solid #44B35D',
        'transition': 'background 400ms ease',
        'background-color': `${color}`
      })
    },

    revealAllLetters: function (wordLetters, color = 'green') {
      wordLetters.forEach(letter => this.revealLetter(letter, color));
    },

    
    reset: function () {
      //    removes the word
      $('.guessLetter').remove();
      //    resets  the alphabet
      $('.letter').css('filter', '');
      //    resets the tree
      Animation.treeToASpring();
      //    resets the apples
      applesCopy = [].slice.call(APPLES);
      document.querySelectorAll('.apple').forEach(apple => {
        var top = $(apple).attr('data-top');
        $(apple).css({
          'top': `${top}`,
          'animation': ''
        });
      })
      //    resets message
      $message.text(CHOOSE);
    },

    addFruitBasket: function addFruitBasket() {
      $('.basket_list').text(`${currentGame.basket.reduce( (result, word) => {
        return result = result ? result + ', ' + word : word;
        }, '')}`);
    },

  }

  var Game = {
    init: function () {
      this.basket = [];
      this.fruitsPicked = 0;
      this.language = '_EN';
      this.pickAWord_EN = buildPick('_EN');
      this.pickAWord_GE = buildPick('_GE');
      this.pickAWord_FR = buildPick('_FR');
      this.pickAWord_HU = buildPick('_HU');
    },

    nbFruitsInBasket: function nbFruitsInBasket() {
      return this.basket.length;
    },

    addFruitBasket: function addFruitBasket() {
      var word = currentRound.wordLetters.join('');
      this.basket.push(word);
    },

    updateLanguage: function (language) {
      this.language = language;
    }
  }

  var Round = function (word) {

    function SetNewRound() {
      this.wordLetters = word.split('').map(letter => letter.toUpperCase());
      this.uniqLetters = this.wordLetters.reduce(function (result, letter) {
        if (result.includes(letter)) {
          return result;
        } else {
          result.push(letter);
          return result;
        }
      }, []);
      this.lettersTried = [];
      this.lettersGuessed = [];
    };

    var proto = SetNewRound.prototype;

    proto.play = function play() {
      var context = this;

      (function fillWord() {
        context.wordLetters.forEach(function (letter) {
          var $element = $(document.createElement('div'));
          var $image = $(document.createElement('img'));
          $element.addClass('guessLetter');
          $image.addClass('wordLetter');
          $image.attr('src', `./assets/${letter}.png`);
          $image.attr('data-id', `${letter.toUpperCase()}`)
          $image.css({
            'filter': 'blur(20px)',
          });
          $image.appendTo($element);
          $element.appendTo('.fill');
        });
      }());

      $alphabet.on('click', playGame);
    };

    proto.checkGoodGuess = function googGuess(letter) {
      return this.wordLetters.includes(letter);
    }

    return word ? new SetNewRound() : null;
  };

  // ------------------------------- EVENTS --------------------------------- //

  // ------>> MENUS <<-------- //

  $openMenu.on('click', function (e) {
    $hamburger.css({
      'transform': 'rotateZ(45deg)',
      'transform-origin': 'center'
    });
    $hamburger.hide();
    $cross.show();
    $menu.slideDown();
  })

  $closeMenu.on('click', function (e) {
    slideUpMenu();
  })

  // ------>> PICK A FRUIT <<-------- //

  $start.on('click', function (e) {
    if (!currentGame) {
      currentGame = Object.create(Game)
      currentGame.init();
      // English is the default language
      pickAWord = currentGame['pickAWord_EN'];
    }
    Board.reset();
    setUpNewRound();
  })

  // ------>> RESTART THE GAME <<-------- //

  $restart.on('click', function (e) {
    window.location.reload();
  })

  // ------>> CHOOSE A LANGUAGE <<-------- //
  // DEPLAYS A SUBMENU
  $language.on('click', function (e) {
    $('.english, .german, .french, .hungarian').toggle();
  })
  // HANDLES THE CHOICE OF LANGUAGE
  $('.english, .german, .french, .hungarian').on('click', function (e) {
    var language = '_' + `${e.target.className.split(' ')[1].slice(0, 2).toUpperCase()}`;

    function changeLanguage() {
      pickAWord = currentGame[`pickAWord${language}`];
    }

    if (currentGame) {
      currentGame.updateLanguage(language);
      changeLanguage();
      Board.reset();
      setUpNewRound();
    } else {
      currentGame = Object.create(Game);
      currentGame.init();
      changeLanguage();
      Board.reset();
      setUpNewRound();
    }
    // indicates which language is in use and which languages have been already picked
    document.querySelectorAll('.control').forEach(control => $(control).css('background-color', 'aqua'));
    $(e.target).css({
      'background-color': 'green',
      'color': '#64B167',
    });

    // changes header acconding to the language chosen
    $('header h1').text(`${HEADERS[language]}`);

  })
  // DEALS WITH CLICK ON ALPHABET WHEN THE GAME IS NOT BEGINED
  $alphabet.on('click', function (e) {
    if (!currentGame) {
      messaging('Pick a Fruit first!');
    } else if (!currentRound) {
      messaging(`${HEADERS[currentGame.language]}`)
    }
  })

  $('main').add('.title').on('click', function (e) {
    slideUpMenu();
  })
})
