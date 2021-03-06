String.prototype.contains = function(test) {
    return this.indexOf(test) == -1 ? false : true;
};

// Doc ready
$(function(){
    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline
    $(".message").hide();
    function simpleSearchC() {
        search( $( "input#query").val() + ' club', $( "#results" ), $( ".template.result" ) );
    }
    function simpleSearchB() {
        search( $( "input#query").val() + ' bar', $( "#results" ), $( ".template.result" ) );
    }
    function simpleSearch() {
        search( $( "input#query").val(), $( "#results" ), $( ".template.result" ) );
    }

    $( "[id ='club']" ).click(function() {simpleSearchC()} );
    $( "[id='bar']" ).click(function () {simpleSearchB()} );

    // Performs search when 'enter' key is pressed
    $( "input#query" ).keypress(function( event ) {
        if ( event.which == 13 ) simpleSearch();
    });

    $('.result').hide();
});

// Input: query string, results container, result HTML template
// Effect: makes an AJAX call to the server to get the results of the
// query, and then injects results into the DOM
// Output: void
function search(query, $container, $template){
    $.ajax({
        type: 'GET',
        url: 'http://is-info320t3.ischool.uw.edu:8080/solr-example/collection1/select',
        dataType: 'JSONP',
        data: {
            'q': query,
            'qf': 'content title^3.0',
            'wt': 'json',
            'indent': 'false',
            'defType': 'edismax',
            'spellcheck': 'true',
            "highlighting": "true",
            "hl.simple.pre":"<em>",
            "hl.simple.post":"<em>",
            "hl.fl":"title,content",
            "hl":"true"
        },
        jsonp: 'json.wrf',
        success: function (data) {
            console.log(data);
            renderResults(data.response.docs, data.spellcheck, $container, $template, data.highlighting);
        }
    });
}

// Input: JSON array of results, results container, result HTML template
// Effect: Replaces results container with new results, and renders
// the appropriate HTML
// Output: void
function renderResults(docs, spellcheck, $container, $template, highlighting){
    $container.empty(); // If there are any previous results, remove them
    $('.result').show();

    console.log(highlighting);

//    var templateClone;
    if(docs != null){
        $.each(docs, function(index, doc){
            var result = $('<a>', {href: doc.url, class:"list-group-item"});
            result.append('<h3 id="title1">');
            result.append('<p>');
            result.append('<h2>');
            result.find('h3').html(highlight(doc.title));
            result.find('p').html(highlight(maxWords(doc.content,50)));
            $('#results').append(result);
        });
    }

    if(spellcheck != null){
        var suggestBox = $("#suggestion");
        suggestBox.empty();
        $(".message").show();
        if(spellcheck.suggestions.length > 0){
            $.each(spellcheck.suggestions[1].suggestion, function(index, suggestion){
                suggestBox.append("<div class = 'correction'>" + suggestion + "</div>");
            });

            $(".correction").on("click", function(object){
                var target = $(object.target);
                search(target.html(), $container, $template);
                $("input#query").val(target.html());
                $(".message").hide();
            });
        }else{
            $(".message").hide();
        }

    }

}


function highlight(text) {
    query = $( "input#query").val();
    var textArray = text.split(" ");
    for(var i = 0; i < textArray.length; i++){
        if(query != null && query.trim() != "" ){
            if(textArray[i].contains(query)){
                textArray[i] = "<span class = 'highlight'>" + textArray[i] + "</span>";
            }
        }
    }
    return textArray.join(" ");
}

// Cuts off lengthy content to a given maximum number of words
// Input: string of words, maximum number of words
// Effects: none
// Output: the trimmed words
function maxWords(content, max) {
    var words = content.split(' ', max);
    var idx;
    var cutContent = "";
    for (idx = 0; idx < words.length; idx++) {
        cutContent += words[idx];
        cutContent += (idx + 1 == words.length ? "" : " ");
    }
    return cutContent + "...";
}
