/**
 * Created by Manjesh on 22-12-2015.
 */
$(function () {
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