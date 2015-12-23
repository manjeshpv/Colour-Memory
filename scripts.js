/**
 * Created by Manjesh on 22-12-2015.
 */
$(function () {


    // refined add event cross browser
    function addEvent(elem, event, fn) {
        if (typeof elem === "string") {
            elem = document.getElementById(elem);
        }

        // avoid memory overhead of new anonymous functions for every event handler that's installed
        // by using local functions
        function listenHandler(e) {
            var ret = fn.apply(this, arguments);
            if (ret === false) {
                e.stopPropagation();
                e.preventDefault();
            }
            return(ret);
        }

        function attachHandler() {
            // set the this pointer same as addEventListener when fn is called
            // and make sure the event is passed to the fn also so that works the same too
            var ret = fn.call(elem, window.event);
            if (ret === false) {
                window.event.returnValue = false;
                window.event.cancelBubble = true;
            }
            return(ret);
        }

        if (elem.addEventListener) {
            elem.addEventListener(event, listenHandler, false);
        } else {
            elem.attachEvent("on" + event, attachHandler);
        }
    }



    function addClass(elem, cls) {
        var oldCls = elem.className;
        if (oldCls) {
            oldCls += " ";
        }
        elem.className = oldCls + cls;
    }

    function removeClass(elem, cls) {
        var str = " " + elem.className + " ";
        elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
    }


    function findItem(items, target) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === target) {
                return(i);
            }
        }
        return(-1);
    }

    var keys = {up: 38, down: 40, left: 37, right: 39,enter:13};
    var cards = document.getElementById("Playfield").getElementsByClassName("card");
    addEvent(document, "keydown", function(e) {
        // get key press in cross browser way
        var code = e.which || e.keyCode;
        // number of items across
        var width = 4;
        var increment, index, newIndex, active;

        switch(code) {
            case keys.up:
                increment = -width;
                break;
            case keys.down:
                increment = width;
                break;
            case keys.left:
                increment = -1;
                break;
            case keys.right:
                increment = 1;
                break;
            case keys.enter:
                $('.active-card').trigger('click');
                break;
            default:
                increment = 0;
                break;
        }
        if (increment !== 0) {
            active = document.getElementById("Playfield").getElementsByClassName("active-card")[0];
            index = findItem(cards, active);
            newIndex = index + increment;
            if (newIndex >= 0 && newIndex < cards.length) {
                removeClass(active, "active-card");
                addClass(cards[newIndex], "active-card");
            }
            // prevent default handling of up, down, left, right keys
            return false;
        }
    });

    var freeze = false,
        firstShuffle = true,
        curPlayer = 0,
        maxPlayers = 1,
        shuffle,
        cardClick,
        changeGameType,
        showScore,
        setupPlayers,
        players,
        tCards,
        determineWinner;
    showScore = function () {
        var i;
        for (i = 0; i < players.length; i += 1) {
            players[i].el.innerHTML = '<b>SCORE: ' + players[i].matches + '</b>';
            if (curPlayer === i) {
                $(players[i].el).addClass('active');
            } else {
                $(players[i].el).removeClass('active');
            }
        }
    };
    determineWinner = function () {
        var winner = 0, isDraw, i;
        if (players.length === 1) {
            var name = prompt("Please enter your name", "Harry Potter");
            var email = prompt("Please enter your email", "harry@potter.com");
            jQuery.ajax({
                url: "https://api.mongolab.com/api/1/databases/tsc/collections/games?apiKey=lLf757Qq1badmMAwhHT6Y21tRCgKt1rr",
                type: "POST",
                data: JSON.stringify({name: name, email: email, score: players[0].matches}),
                contentType: "application/json",
                success: function (res) {
                    currentPlayerID = res._id.$oid
                    jQuery.ajax({
                        url: "https://api.mongolab.com/api/1/databases/tsc/collections/games?apiKey=lLf757Qq1badmMAwhHT6Y21tRCgKt1rr",
                        contentType: "application/json",
                        success: function (response) {
                            console.log(response)
                            response = (_.sortBy(response,'score')).reverse()
                            curretRating = _.pluck(_.pluck(response,'_id'),'$oid').indexOf(currentPlayerID);
                            alert("Your rating is: "+(curretRating+1));

                            var data = {response:response};
                            var template = "<table  class='table table-striped'>" +
                                "<thead><tr><th>Name</th><th>Email</th><th>Score</th></tr></thead>" +
                                "<tbody>" +
                                "{{#response}}" +
                                "<tr><td>{{name}}</td><td>{{email}}</td><td>{{score}}</td></tr>" +
                                "{{/response}}</tbody></table>";
                            var html = Mustache.to_html(template, data);
                            console.log(html)
                            $('#results').html(html);
                            $('#results').show();
                            $('#Playfield').hide();

                        }, error: function (err) {
                            console.log(err)
                        }
                    })

                }, error: function (err) {
                    console.log(err)
                }
            })
        }
    };
    cardClick = function () {
        var t;
        if (!freeze) {
            if (!$(this).hasClass('matched') && $(this).hasClass('down')) {
                $(this).removeClass('down');
                t = $('.card:not(.down, .matched)');
                if (t.length >= 2) {
                    players[curPlayer].turns += 1;
                    if (t[0].getAttribute('data-face') === t[1].getAttribute('data-face')) {
                        $(t).addClass('matched');
                        players[curPlayer].matches += 1;
                        if ($('.matched').length === $('.card').length) {
                            showScore();
                            determineWinner();
                        }
                    } else {

                        freeze = true;
                        setTimeout(function () {
                            $(t).addClass('down');
                            freeze = false;
                            players[curPlayer].matches -= 1;
                            curPlayer += 1;
                            if (curPlayer >= players.length) { curPlayer = 0; }
                            showScore();
                        }, 1000);
                    }
                    showScore();
                }
            }
        }
    };
    shuffle = function () {
        var allCards, i;
        allCards = $('.card');
        $(allCards).addClass('down').removeClass('matched');
        tCards = [];
        while (allCards.length > 0) {
            i = parseInt(Math.random()*allCards.length);
            tCards.push(allCards[i]);
            allCards.splice(i,1);
        }
        if (firstShuffle) {
            $('#Playfield').empty();
            $('#Playfield').append(tCards);
            $('.card').click(cardClick);
            firstShuffle = false;
        } else {
            freeze = true;
            setTimeout(function () {
                $('#Playfield').empty();
                $('#Playfield').append(tCards);
                $('.card').click(cardClick);
                freeze = false;
            }, 700);
        }
        $('#Playfield .card:first-child').addClass("active-card");
    };
    setupPlayers = function () {
        var i;
        players = [];
        $('#PlayScore').empty();
        for (i = 0; i < maxPlayers; i += 1) {
            players.push({turns: 0, matches: 0, el: document.createElement('li')});
            $('#PlayScore').append(players[i].el);
        }
    };

    $('#shuffleButton').click(shuffle);

    setupPlayers();
    showScore();
    shuffle();
});