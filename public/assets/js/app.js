//Handle Scrape button and search term
$("#scrape").on("click", () => {
    let searchTerm = $('#scrapesearch').val().trim() || 'politics';
    // alert('SCRAPE SEARCH: ' + searchTerm);
    $.ajax({
        method: "GET",
        url: "/scrape/" + searchTerm,
    }).done((data) => {
        console.log(data)
        window.location = "/"
    })
});

//Set clicked nav option to active
$(".navbar-nav li").click(function() {
   $(".navbar-nav li").removeClass("active");
   $(this).addClass("active");
});

//Event handler for save article
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done((data) => {
        window.location = "/"
    })
});

//Event handler for delete article
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).done((data) => {
        window.location = "/saved"
    })
});

//Event handler for note save
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).done((data) => {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});

//Event Handler for note delete
$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done((data) => {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});