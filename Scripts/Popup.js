    var main = document.getElementsByTagName('main')[0];
    var resetPreset = document.getElementById('resetPreset');
    var svgNS = "http://www.w3.org/2000/svg";

    var presetsClass;
    var data;
    var shortcuts;


    document.addEventListener('DOMContentLoaded', () => {
      loadPresets(Initialize)
    });

    function Initialize(loadedData) {
      data = loadedData
        
      function initWithBrowserCommands(browserCommands) {
        shortcuts = browserCommands.filter(cmd => cmd.name.match(/resize\d/))

        for (var i = 0; i < data.length; i++) {
          CreatePreset(data[i], i);
        }

        Sortable.create(main, {
          animation: 250,
          onStart: function(evt) {
            var presets = document.getElementsByClassName('preset');
            for (var i = 0; i < presets.length; i++) {
              presets[i].classList.add('presetDisableHover');
            }
          },
          onEnd: function() {
            var presets = document.getElementsByClassName('preset');
            for (var i = 0; i < presets.length; i++) {
              presets[i].classList.remove('presetDisableHover');
              presets[i].setAttribute('data-sortorder',i);
              data.find(p=>p.id==presets[i].getAttribute('data-id')).sortorder=i;
              }
            chrome.storage.local.set({
              "presets": data
            }, () => {

            });
          }
        });
      }

      try {
        browser.commands.getAll().then(initWithBrowserCommands)
      } catch (err) {
        chrome.commands.getAll((initWithBrowserCommands))
      }
    }

    function CreatePreset(preset, index) {
      if(preset.isempty==false)
      {
        var shortcut = index < shortcuts.length ? shortcuts[index] : null;

        var presetElem = document.createElement('div');
        presetElem.className = 'preset';
        presetElem.setAttribute('data-sortorder',preset.sortorder);
        presetElem.setAttribute('data-id', preset.id);
        presetElem.setAttribute('data-width', preset.width);
        presetElem.setAttribute('data-height', preset.height);
        presetElem.setAttribute('data-left', preset.left);
        presetElem.setAttribute('data-top', preset.top);
        var btnRemove = document.createElement('i');
        btnRemove.className = "icon-trash";
        btnRemove.setAttribute('data-removeElem', preset.id);
        var sizeElem = document.createElement('span');
        sizeElem.textContent = Math.round(preset.width / 100 * screen.width) + ' * ' +
                             Math.round(preset.height/100 * screen.height);
        var img = document.createElement('div');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'c' + preset.id);
        canvas.setAttribute('width', '64');
        canvas.setAttribute('height', '64');
        presetElem.appendChild(btnRemove);
        presetElem.appendChild(sizeElem);
        presetElem.appendChild(img);
        presetElem.appendChild(canvas);
        if(shortcut != null) {
          var key = shortcut.shortcut.replace('MacCtrl', 'Ctrl')
          var hotkeyInfo = document.createElement('span');
          hotkeyInfo.className = 'hotkey';
          hotkeyInfo.textContent = key
          presetElem.appendChild(hotkeyInfo)
        }
        main.appendChild(presetElem);
        DrawRec(canvas.id, Math.round(preset.left /100 * 45.6), Math.round(preset.top / 100 * 30), Math.round(preset.width / 100 *  45.6), Math.round(preset.height/100  * 30));
      }
      else
      {
        var presetElem = document.createElement('div');
        presetElem.className = 'preset';
        presetElem.setAttribute('data-sortorder',preset.sortorder);
        presetElem.setAttribute('data-id', preset.id);
        main.appendChild(presetElem);
      }
    }

    function DrawRec(canvasId, x, y, w, h) {
      var canvas = document.getElementById(canvasId);
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#663399";
      ctx.rect(x + 9, y + 15, w, h);
      ctx.fill();
    }


    var selectedElem;
    document.addEventListener('click', (e) => {
      let dialog = document.getElementsByClassName("dialogWrapper")[0];
      let dialogReset = document.getElementsByClassName("dialogWrapper")[1];

      if (e.target.className == "icon-trash") {
        dialog.style.display = "flex";
        selectedElem = e.target.parentElement.getAttribute('data-id');
      }
      switch (e.target.id) {
        case "btnEdit":
          var presets = document.getElementsByClassName('preset');
          if (e.target.state == undefined) {
            for (var i = 0; i < presets.length; i++) {
              presets[i].classList.add('editMode');
            }
            e.target.classList.add('editMode-cancel');
            e.target.state = "IsInEditMode";
          } else {
            for (var i = 0; i < presets.length; i++) {
              presets[i].classList.remove('editMode');
            }
            e.target.classList.remove('editMode-cancel');
            e.target.state = undefined;
          }
          break;
        case "btnNewPreset":
          chrome.tabs.create({
            'url': '../CustomPreset.html'
          });
          break;
        case "btnCancel":
          dialog.style.display = "none";
          break;
          case "btnResetCancel":
            dialogReset.style.display = "none";
            break;
        case "btnOk":
          dialog.style.display = "none";
          var dataID = selectedElem;
          EmptyMain();
          RemovePreset(dataID);
          var presets = document.getElementsByClassName('preset');
          for (var i = 0; i < presets.length; i++) {
            presets[i].classList.remove('editMode');
          }
          var btnEdit = document.getElementById('btnEdit');
          if (btnEdit.state != undefined) {
            btnEdit.classList.remove('editMode-cancel');
            btnEdit.state = undefined;
          }
            data.sort(comparePresets);
          for (var i = 0; i < data.length; i++) {
            CreatePreset(data[i], i);
          }
          break;
          case "btnResetOk":
          chrome.storage.local.remove('presets', () => chrome.runtime.sendMessage({
            method: 'notify',
            message: 'Layouts are reset to the default values'
          }));

          const request = new XMLHttpRequest();
          request.open('GET', '../Content/Data.json');
          request.onload = () => {
            data = JSON.parse(request.responseText).presets;
            EmptyMain();
            Initialize();
          };
          request.send();
            dialogReset.style.display = "none";
          break;
        default:
      }

      if (e.target.className == "preset") {
        let x = parseInt(e.target.getAttribute('data-left'));
        let y = parseInt(e.target.getAttribute('data-top'));
        let w = parseInt(e.target.getAttribute('data-width'));
        let h = parseInt(e.target.getAttribute('data-height'));
        resizeWindow(x, y, w, h);

      }
    });



    function EmptyMain() {
      while (main.firstChild) {
        main.removeChild(main.firstChild);
      }
    }

    function RemovePreset(dataID) {
    data.map((obj) =>{
      if(obj.id==dataID)
      {
        obj.isempty=true;
      }
    });
      chrome.storage.local.set({
        "presets": data
      }, () => {

      });
    }
    resetPreset.addEventListener('click', () => {
      let dialogForReset = document.getElementsByClassName("dialogWrapper")[1];
        dialogForReset.style.display = "flex";
    });