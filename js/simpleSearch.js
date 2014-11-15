// Doc ready
$(function(){
    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline
    $(".message").hide(); 
    function simpleSearch() {
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    }

    $( "button#search" ).click(function() {simpleSearch()} );

    // Performs search when 'enter' key is pressed
    $( "input#query" ).keypress(function( event ) {
        if ( event.which == 13 ) simpleSearch();
    });
});

// Input: query string, results container, result HTML template
// Effect: makes an AJAX call to the server to get the results of the
// query, and then injects results into the DOM
// Output: void
function search(query, $container, $template){
    $.ajax({
        type: 'GET',
            url: 'https://is-info320t3.ischool.uw.edu:8443/solr-example/collection1/select',
        dataType: 'JSONP',
        data: {
            'q': query,
            'qf': 'content title^3.0',
            'wt': 'json',
            'indent': 'false',
            'defType': 'edismax',
            'spellcheck': 'true',
        },
        jsonp: 'json.wrf',
        success: function (data) {
            renderResults(data.response.docs, data.spellcheck, $container, $template);
        }
    });
}

// Input: JSON array of results, results container, result HTML template
// Effect: Replaces results container with new results, and renders
// the appropriate HTML
// Output: void
function renderResults(docs, spellcheck, $container, $template){
    $container.empty(); // If there are any previous results, remove them
    var result;
    if(docs != null){
        $.each(docs, function(index, doc){
            result = $template.clone();
            result.find( ".title > a" )
                .prop( "href", doc.url)
                .find( "h3" )
                .append( doc.title );
            result.find( ".url" ).append( doc.url );
            result.find( ".content" ).append( maxWords(doc.content, 100) );
            result.removeClass( "template" );
            $container.append(result);
            console.log(result);
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
    // $.each(docs, spellcheck, function(index, doc, suggestion){
    //     result = $template.clone();
    //     result.find(".suggestion").append(suggestion);
    //     result.find( ".title > a" )
    //         .prop( "href", doc.url)
    //         .find( "h3" )
    //         .append( doc.title );
    //     result.find( ".url" ).append( doc.url );
    //     result.find( ".content" ).append( maxWords(doc.content, 100) );
    //     result.removeClass( "template" );
    //     $container.append(result);
    //     console.log(result);
    // });
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
