window.az = window.az || {};

$(document).ready(function(){

  var data;

  // загружаем json
  $.ajax({
    url:'az.json'
  }).done(function(res){
    window.az.shortcodes = res;
    showButtons();
    console.log(window.az);
  });

});

function showButtons(){

  for( shortcode in window.az.shortcodes ){
    if(window.az.shortcodes[shortcode].params)  {
      $('body').append('<button onClick="javascript:AZHTML.renderForm(\''+shortcode+'\')">'+shortcode+'</button>');
    }
  }

}
