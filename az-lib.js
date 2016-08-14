;(function($,window){

  var AZHTML = window.AZHTML || {};

  var dialog;

  AZHTML.renderForm = function(shortcode){



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
          field = `<fieldset>
          <legend>${item.heading}</legend>

          <div class="group-row">

          ${AZHTML.renderParams(item.params, item.param_name, 0)}

          <a href="" class="">Add</a>
          </div>

          </fieldset>`;
        break;
        case 'textfield':
          field = `<p><label>${item.heading}</label>
          <input name='${sub===false ? item.param_name : sub+'['+iter+']['+item.param_name+']'}' type='text' />
          <div>${item.description}</div></p>`;
        break;
        case 'checkbox':
        field = `<p><div>${item.heading}</div>
            ${Object.keys(item.value).map(function(value,index){
              return '<input id="'+item.value[value]+'" type="checkbox" name="'+item.param_name+'" value="'+item.value[value]+'"><label for="'+item.value[value]+'">'+value+'</label><br/>';
            }).join('')}
            <div>${item.description}</div>
          </p>`;
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

          field = `<p><label>${item.heading}</label>
            <select>
              ${options}
            </select> <div>${item.description}</div></p>`;
        break;
        case 'vc_link':
          field = `<p><label>${item.heading}</label> vc_link <div>${item.description}</div></p>`;
        break;
        case 'textarea':
          field = `<p><label>${item.heading}</label> textarea <div>${item.description}</div></p>`;
        break;
        case 'attach_image':
          field = `<p><label>${item.heading}</label> attach_image <div>${item.description}</div></p>`;
        break;
        case 'attach_images':
          field = `<p><label>${item.heading}</label> attach_images <div>${item.description}</div></p>`;
        break;
        case 'colorpicker':
          field = `<p><label>${item.heading}</label><input type="text" class="input-colorpicker"> <div>${item.description}</div></p>`;
        break;
        case 'autocomplete':
          field = `<p><label>${item.heading}</label> autocomplete <div>${item.description}</div></p>`;
        break;
        case 'iconpicker':
          field = `<p><label>${item.heading}</label> iconpicker <div>${item.description}</div></p>`;
        break;

      }

      return field;
    }).join('');

    return fields;

  }

  window.AZHTML = AZHTML;

}(jQuery , window));
