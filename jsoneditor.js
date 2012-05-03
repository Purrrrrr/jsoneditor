$.fn.extend({ 
  jsoneditor: function() {
    var input = $(this);
    var types = {
      'null':   "Null",
      'string': "String",
      'object': "Object",
      'list':   "List" 
    }
    var emptydata = {
      'null':   null,
      'string': "",
      'object': {},
      'list':   []
    }

    var editor = $('<div class="jsoneditor">').insertAfter(input).append(input);
    input.change(function() {
      var data = $.parseJSON(input.val());
      editor.children('.jsondata').remove();
      editor.append(getEditor(data));
    });
    input.change();

    function getEditor(data) {
      if (data instanceof Array) {
        return getListEditor(data);
      } else if (data === null) {
        return getNullEditor(data);
      } else if (typeof(data) == 'object')  {
        return getObjectEditor(data);
      } else {
        return getStringEditor(data);
      }
    };

    function getStringEditor(data) {
      var editor = $('<span>'+data+'</span>').editable(function(data) {
        writeJSON();
        return data;
      }, {
        placeholder: '',
        type: 'textarea',
        onblur: 'submit',
        cols: 24,
        rows: 2,
      });
      var container = $('<div class="jsondata scalar string"></div>').append(editor);
      insertTypeChanger(container, 'string');
      return container;
    }
    function getNullEditor(data) {
      var container = $('<div class="jsondata scalar null"></div>');
      insertTypeChanger(container, 'null');
      return container;
    }
    function getListEditor(data) {
      var container = $('<div class="jsondata list"></div>');

      for(var i = 0; i < data.length; i++) {
        var item = getEditor(data[i]);
        container.append(item);
      }
      var adder = $('<div class="addchild">New entry +</div>').click(function() {
        var newitem = getStringEditor("");
        adder.before(newitem);
        writeJSON();
      }).appendTo(container);

      insertTypeChanger(container, 'list');
      return container;
    }
    function getObjectEditor(data) {
      var container = $('<div class="jsondata object"></div>');
      var adder = $('<div class="addchild">New entry +</div>').click(function() {
        addPair('key', 'value');
        writeJSON();
      }).appendTo(container);

      for(key in data) {
        addPair(key, data[key]);
      }

      function addPair(key, value) {
        var item = getEditor(value);
        var key = $('<div class="jsonkey">'+key+'</div>').editable(function(data) {
          writeJSON();
          return data;
        });
        var pair = $('<div class="jsondata key_value_pair"></div>');
        pair.append(key);
        pair.append(item);
        adder.before(pair);
      }

      insertTypeChanger(container, 'object');
      return container;
    }

    function insertTypeChanger(element, selected) {
      var container = $('<div class="type">'+types[selected]+'</div>').appendTo(element).editable(function(data) {
        var newdata = emptydata[data];
        element.after(getEditor(newdata));
        element.remove();
        writeJSON();
        return data;
      }, {
        data: JSON.stringify(types),
        type: 'select',
        submit: 'OK',
      });
      $('<div class="remover">x</div>').click(function() {
        if (element.parent().hasClass('key_value_pair')) {
          element.parent().remove();
        } else {
          element.remove();
        }
        writeJSON();
      }).appendTo(element);
    }
    
    function writeJSON() {
      setTimeout(function() {
        function getData(elem) {
          var data = null;
          if (elem.hasClass('string')) {
            data = elem.children('span').html();
          } else if (elem.hasClass('list')) {
            data = [];
            elem.children('.jsondata').each(function() {
              data.push(getData($(this)));
            });
          } else if (elem.hasClass('object')) {
            data = {};
            elem.children('.jsondata').each(function() {
              key = $(this).children('.jsonkey').html();
              data[key]= getData($(this).children('.jsondata'));
            });
          }
          return data;
        }
        
        var data = getData(editor.children('.jsondata'));
        input.val(JSON.stringify(data));
      }, 10);
    }

  }
});
