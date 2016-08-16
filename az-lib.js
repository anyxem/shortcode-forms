;(function($,window){

  var AZHTML = window.AZHTML || {};

  var dialog;

  AZHTML.filtersInit = function(){
    var headTag = window.document.querySelector('head');
    var styleTag = window.document.createElement('style');
    styleTag.id = 'upStyle';
    headTag.appendChild(styleTag);
  }

  AZHTML.filtersUpd = function(){

    var formdata = $('form:last').serializeArray();
    console.log(formdata);
    var newStyles = `
[data-depelement] { display: none; }
${formdata.map(function(item){
  return (`[data-depelement *= "${item.name}"][data-depvalue *= "${item.value}"] { display: block; }`);
}).join('')}
    `;

    window.document.getElementById('upStyle').innerHTML = newStyles;

  }

  AZHTML.renderForm = function(shortcode){


        this.filtersInit();
        this.filtersUpd();


        var fields = AZHTML.renderParams(window.az.shortcodes[shortcode].params);

        var html = `
        <div id="dialog-form" title="${window.az.shortcodes[shortcode].name}">

          ${
            window.az.shortcodes[shortcode].description != undefined ?
            `<p>${window.az.shortcodes[shortcode].description}</p>` : ''
          }


          <form>

              ${fields}
              <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">

          </form>
        </div>
        `;
        dialog = $( html ).dialog({
          autoOpen: false,
          height: 500,
          width: 500,
          modal: true,
          buttons: {
            "Insert Shortcode": AZHTML.generateShortcode.bind(this,shortcode),
            Cancel: function() {
              dialog.dialog( "close" );
            }
          },
          close: function() {


          }
        });

        dialog.dialog( "open" ) ;


        $('.clone-row').off().on('click',function(e){
          e.preventDefault();
          var row = $(this).prev();
          row.clone().insertAfter(row).find('input').val('');
        });



        $('.input-colorpicker').colorpicker({
                parts:          'draggable',
                showNoneButton: true
            });




    return html;
  }

  AZHTML.generateShortcode = function(shortcode, e){



    var formdata = dialog.find('form').serializeArray();
    dialog.dialog( "close" );

    var sub_shortcode = [];
    var sub_shortcode_text = '';
    var checkbox_text = '';

    console.log(formdata);
    var params = formdata.map(function(item){

console.log(item);

      if(item.name.indexOf('[]') > -1){ // Чекбокс значит
        var gname = item.name.split('[]')[0];
        var iter = item.name.split('[')[1].split(']')[0];
        var pname = item.name.split('[')[2].split(']')[0];
        sub_shortcode[gname] = sub_shortcode[gname] || [];
        sub_shortcode[gname][iter] = sub_shortcode[gname][iter] || {};
        sub_shortcode[gname][iter][pname] = item.value;
        return;
      }else if(item.name.indexOf('[') > -1){
        var gname = item.name.split('[')[0];
        var iter = item.name.split('[')[1].split(']')[0];
        var pname = item.name.split('[')[2].split(']')[0];
        sub_shortcode[gname] = sub_shortcode[gname] || [];
        sub_shortcode[gname][iter] = sub_shortcode[gname][iter] || {};
        sub_shortcode[gname][iter][pname] = item.value;
        return;
      }else{
        return ' '+item.name+'="'+item.value+'"';
      }

    }).join('');


    for( var sc in sub_shortcode ){
      sub_shortcode_text = sub_shortcode_text + " "+sc+'="'+ encodeURI(JSON.stringify(sub_shortcode[sc])) +'"';
    }

    var payload = `[${shortcode}${params}${sub_shortcode_text}][/${shortcode}]`;
    console.log(payload);

    return true;
  }

  AZHTML.renderParams = function(params , sub , iter){

    var sub = sub || false;
    var iter = iter || 0;


    var fields = params.map(function(item,index){
      var field;



      switch (item.type){
        case 'param_group':
          field = `<fieldset ${item.dependency!=undefined?`
          data-depelement="${item.dependency.element}"
          data-depvalue="${typeof item.dependency.value == 'string' ? item.dependency.value : item.dependency.value.map(function(item){return item}).join(',')}"
          `:''}>
          <legend>${item.heading}</legend>

          <div class="group-row">
          ${AZHTML.renderParams(item.params, item.param_name, 0)}
          </div>
          <a href="" class="clone-row">Add</a>

          </fieldset>`;
        break;
        case 'textfield':
          field = `<p ${item.dependency!=undefined?`
          data-depelement="${item.dependency.element}"
          data-depvalue="${item.dependency.value.map(function(item){return item}).join(',')}"
          `:''}><label><span>${item.heading}</span>
          <input name='${sub===false ? item.param_name : sub+'['+iter+']['+item.param_name+']'}' type='text' />
          ${item.description!=undefined?`<em>${item.description}</em>`:''}</label></p>`;
        break;
        case 'checkbox':
        field = `<div>${item.heading}</div>
            ${Object.keys(item.value).map(function(value,index){
              return '<input id="'+item.value[value]+'" type="checkbox" onchange="javascript:AZHTML.filtersUpd()" name="'+item.param_name+'" value="'+item.value[value]+'"><label for="'+item.value[value]+'">'+value+'</label><br/>';
            }).join('')}
            ${item.description!=undefined?`<em>${item.description}</em>`:''}
          `;
        break;
        case 'dropdown':

          if(item.value.length == undefined){
            var options = Object.keys(item.value).map(function(value,index){
              return '<option value="'+item.value[value]+'">'+value+'</option>';
            }).join('');
          }

          if(item.value.length){
            var options = item.value.map(function(value,index){
              return '<option value="'+value[0]+'">'+value[1]+'</option>';
            }).join('');
          }

          field = `<label>${item.heading}</label>
            <select onchange="javascript:AZHTML.filtersUpd()" name="${item.param_name}">
              ${options}
            </select>
            ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
            `;
        break;
        case 'vc_link':
          field = `<label>${item.heading}</label> vc_link
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'textarea':
          field = `<label>${item.heading}</label> textarea
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'attach_image':
          field = `<label>${item.heading}</label> attach_image
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'attach_images':
          field = `<label>${item.heading}</label> attach_images
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'colorpicker':
          field = `<label>${item.heading}</label><input type="text" class="input-colorpicker">
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'autocomplete':
          field = `<label>${item.heading}</label> autocomplete
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;
        case 'iconpicker':
          field = `<label>${item.heading}</label> iconpicker
          ${item.description!=undefined?` ${item.description!=undefined?`<em>${item.description}</em>`:''}`:''}
          `;
        break;

      }

      return `<p ${item.dependency!=undefined?`
      data-depelement="${item.dependency.element}"
      data-depvalue="${typeof item.dependency.value == 'string' ? item.dependency.value : item.dependency.value.map(function(item){return item}).join(',')}"
      `:''}>`+field+`</p>`;


    }).join('');

    return fields;

  }


  window.AZHTML = AZHTML;

}(jQuery , window));
