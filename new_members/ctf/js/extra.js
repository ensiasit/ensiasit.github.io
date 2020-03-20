// Fantasy layout stuff.
const NEWS_CHECK_INTERVAL = 30000; // miliseconds

jQuery.fn.center = function () {
  // Thank you stack overflow.
  this.css("position","absolute");
  let topEl = $(".ds-map-task-desc");
  this.css("top", (Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                   $(window).scrollTop() - topEl.offset().top)) + "px");
  this.css("left", (Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                   $(window).scrollLeft()) - topEl.offset().left) + "px");
  return this;
}

const playNews = function(news) {
  let dragon = $(".ds-dragon-left");
  let paper = $("#ds-instant-news");
  let menuNews = $("#menu-news");

  if (paper.css("visibility") === "visible") {
    // Already some news is active.
    return;
  }

  dragon
  .addClass("ds-dragon-animate")
  .click(function() {
    location.href = '/?news';
  });

  menuNews
  .addClass("ds-news-animate");

  paper
  .css("visibility", "hidden")
  .html(news);

  let w = paper.outerWidth();
  const viewportWidth = $("body").innerWidth() - 300;

  if (w > viewportWidth) {
    w = viewportWidth;
  }

  paper
  .css("width", "0px")
  .css("visibility", "visible")
  .animate({
    width: w
  }, 2000);
};

const checkNews = function(lastNewsCount) {
  $.ajax({
    dataType: "json",
    url: "/?news&format=json",
    success: function(data, textStatus) {
    let newsCount = data.news.length;
    if (newsCount != lastNewsCount) {
      const newsTitle = data.news[newsCount - 1].title;
      const html = "New update on the <a href=\"/?news\">News</a> page: \"" + newsTitle + "\"";
      playNews(html);
    } else {
      setTimeout(checkNews, NEWS_CHECK_INTERVAL, lastNewsCount);
    }
  }});
};

const handleNews = function() {
  $.ajax({
    dataType: "json",
    url: "/?news&format=json",
    success: function(data, textStatus) {
    let lastNewsCount = data.news.length;
    setTimeout(checkNews, NEWS_CHECK_INTERVAL, lastNewsCount);
  }});
};

$(function() {
  $(".ds-map-task-icon")
  .click(function(e) {
    const data = e.target.dataset;
    $('.ds-map-task-desc').css("visibility", "hidden");

    $('#ds-task-desc-title').text(data.taskName);

    // HACK: Make the category shorter, otherwise the layout glitches.
    const modifiedCategory = (data.taskCategory == "Reverse Engineering") ? "RE" : data.taskCategory;
    $('#ds-task-desc-category').text(modifiedCategory);

    $('#ds-task-desc-points').text(data.taskPoints);
    $('#ds-task-desc-difficulty').text(data.taskDifficulty);
    $('#ds-task-desc-description').html(data.taskDescription + data.taskCustomTemplate);
    $('#ds-task-desc-solves').text(data.taskSolves);

    $('.ds-map-task-desc .ds-panel-title-left').removeClass('ds-panel-title-solved-left');
    $('.ds-map-task-desc .ds-panel-title-right').removeClass('ds-panel-title-solved-right');
    $('.ds-map-task-desc .ds-panel-title').removeClass('ds-panel-title-solved');
    $('.ds-map-task-desc .ds-panel').removeClass('ds-panel-solved');
    $('.ds-map-task-desc .ds-panel-interior').removeClass('ds-panel-interior-solved');

    if (data.taskSolved) {
      $('.ds-map-task-desc .ds-panel-title-left').addClass('ds-panel-title-solved-left');
      $('.ds-map-task-desc .ds-panel-title-right').addClass('ds-panel-title-solved-right');
      $('.ds-map-task-desc .ds-panel-title').addClass('ds-panel-title-solved');
      $('.ds-map-task-desc .ds-panel').addClass('ds-panel-solved');
      $('.ds-map-task-desc .ds-panel-interior').addClass('ds-panel-interior-solved');
    }

    $(".ds-map-task-desc-panel").center();
    $(".ds-map-task-desc").css("visibility", "visible");
  })
  .each(function(index) {
    const taskName = this.dataset.taskName;
    const taskId = this.dataset.taskId;
    const taskSolved = this.dataset.taskSolved;
    const pos = $(this).position();

    // Create task name underneath the icon.
    let banner = $('<div/>');
    banner
    .addClass("ds-map-banner")
    .attr('data-task-id', taskId)
    .text(taskName)
    .css("visibility", "hidden")
    .appendTo(".ds-map-icons");  // Need to do this now to get proper .width().

    if (taskSolved) {
      banner
      .addClass("ds-map-banner-solved");
    }

    const pos_x = pos.left + 20 - banner.width() / 2;
    const pos_y = pos.top + 40 - 5;
    banner
    .css("top", pos_y)
    .css("left", pos_x)
    .css("visibility", "visible")
    .click(function(e) {
      const taskId = e.target.dataset.taskId;
      $(`.ds-map-task-icon[data-task-id='${taskId}']`).trigger("click");
    });
  });


  $(".ds-panel-title-close").click(function(e) {
    //$('.ds-map-task-desc-panel').css("visibility", "hidden");
    $(".ds-map-task-desc").css("visibility", "hidden");
  });

  $(".ds-map-task-desc").click(function(e) {
    //$('.ds-map-task-desc-panel').css("visibility", "hidden");
    $(".ds-map-task-desc").css("visibility", "hidden");
  });

  $(".ds-map-task-desc-panel").click(function(e) {
    e.stopPropagation();
  });

  $("#switch-to-map").click(function() {
    document.cookie = "mapview=1; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    location.reload();
  });

  $("#switch-to-simple").click(function() {
    document.cookie = "mapview=0; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    location.reload();
  });

  // If there is no mapview cookie set, default to mapview=1.
  if (!document.cookie.includes("mapview=")) {
    document.cookie = "mapview=1; expires=Fri, 31 Dec 9999 23:59:59 GMT";
  }

  // Start polling for news.
  handleNews();
});

