var wrapper = document.getElementById('wrapper');
var area = document.getElementById('area');
var sizeInfo = document.getElementById('sizeInfo');
var txtWidth = document.getElementById('txtWidth');
var txtHeight = document.getElementById('txtHeight');
var txtTop = document.getElementById('txtTop');
var txtLeft = document.getElementById('txtLeft');
var savePreset = document.getElementById('savePreset');
var data;

var isDragStart;
var x, y, width, height;

document.addEventListener('DOMContentLoaded', () => {

  chrome.storage.sync.get(["presets"], results => {
    if (results.presets !== undefined) {
      data = results.presets;
      data.sort(Compare);
    } else {
      let requestURL = '../Content/Data.json';
      let request = new XMLHttpRequest();
      request.open('GET', requestURL);
      request.send();

      request.onload = () => {
        if (request.status === 200) {
          data = JSON.parse(request.responseText).presets;
          chrome.storage.sync.set({
            "presets": data
          });
        }
      };
    }
  });

});

wrapper.addEventListener('mousedown', e => {
  isDragStart = true;
  x = e.pageX - wrapper.offsetLeft;
  y = e.pageY - wrapper.offsetTop;
  if (x < 114) {
    x = 114;
    txtLeft.value = "0";
  } else if(x>wrapper.clientWidth - 225)
  {
    x=wrapper.clientWidth -115;
  }
  else {
    txtLeft.value = Math.round((Math.round((x * 2.7866473149492017416545718432511) - (113 * 2.7866473149492017416545718432511)))/1920 *100);
  }

  if (y < 39) {
    y = 39;
    txtTop.value = "0";
  }
  else if(y>wrapper.clientHeight - 59)
  {
    y=wrapper.clientHeight - 59;
  }
  else {
    txtTop.value =Math.round((Math.round((y * 2.7906976744186046511627906976744) - (40 * 2.7906976744186046511627906976744)))/1200 * 100);
  }


  area.style.top = y + 'px';
  area.style.left = x + 'px';
  area.style.bottom = (wrapper.clientHeight - y) + 'px';
  area.style.right = (wrapper.clientWidth - x) + 'px';
});
wrapper.addEventListener('mousemove', e => {
  if (isDragStart) {
    let top,left,right,bottom;
    let computedWidth =wrapper.clientWidth - (e.pageX - wrapper.offsetLeft);
    let computedHeight =wrapper.clientHeight -(e.pageY - wrapper.offsetTop);

    left=x;
    top=y;
    if(e.pageX - wrapper.offsetLeft <= x)
    {
      left=e.pageX - wrapper.offsetLeft;
    }
    if(e.pageX - wrapper.offsetLeft >x)
    {
      right = wrapper.clientWidth - (e.pageX - wrapper.offsetLeft);
    }
    if(e.pageY - wrapper.offsetTop <= y)
    {
      top=e.pageY - wrapper.offsetTop;
    }
    if(e.pageY - wrapper.offsetTop > y)
    {
      bottom = wrapper.clientHeight - (e.pageY - wrapper.offsetTop);
    }

    if(left<115)
    left=115;
    if(top<40)
    top=40;
    if(right<115)
    right=115;
    if(bottom<59)
    bottom=59;
      area.style.left = left + 'px';
      area.style.top = top + 'px';
      area.style.right = right + 'px';
      area.style.bottom = bottom + 'px';

      txtLeft.value =Math.round((left-115)/(wrapper.clientWidth-225)*100);
      txtTop.value = Math.round((top-40)/(wrapper.clientHeight-99)*100);
      txtWidth.value =Math.round(area.clientWidth / (wrapper.clientWidth-229)*100);
      txtHeight.value =Math.round(area.clientHeight / (wrapper.clientHeight-102)*100);
  /*  if (e.pageX - wrapper.offsetLeft - 114 > 689) {
      computedWidth = 689 - x + 114;
    }
    if (e.pageY - wrapper.offsetTop - 41 > 428) {
      computedHeight = 428 - y + 41;
    }
    if (computedWidth < 0) {
      computedWidth = 0;
    }
    if (computedHeight < 0) {
      computedHeight = 0;
    }
    width = Math.round(computedWidth * 2.7866473149492017416545718432511);
    height = Math.round(computedHeight * 2.7906976744186046511627906976744); */

    //sizeInfo.innerHTML = width + " &#215; " + height;

    //if (computedWidth >= 50 || computedHeight >= 50) {
    //  sizeInfo.style.display = "inline";
    //} else {
    //  sizeInfo.style.display = "none";
    //}
  }
});
wrapper.addEventListener('mouseleave',e=>{
  if(isDragStart==true)
  {
    isDragStart=false;
  }
});
wrapper.addEventListener('mouseup', e => {
  isDragStart = false;
});

txtTop.addEventListener('keyup', () => {
  if (txtTop.value != "")
    Valid(txtTop);
  y = Math.round(txtTop.value / 2.7866473149492017416545718432511) + 39;
  if (txtTop.value < 0) {
    y = 39;
  }
  if (y + height > 430) {
    y = 467 - height;
  }
  area.style.top = y + 'px';
});

txtLeft.addEventListener('keyup', () => {
  if (txtLeft.value != "")
    Valid(txtLeft);
  x = Math.round(txtLeft.value / 2.7906976744186046511627906976744) + 114;
  if (txtLeft.value < 0) {
    x = 114;
  }
  if (x + width > 689) {
    x = 800 - width;
  }
  area.style.left = x + 'px';

});

txtWidth.addEventListener('keyup', () => {
  if (txtWidth.value != "")
    Valid(txtWidth);
  width = Math.round(txtWidth.value / 2.7866473149492017416545718432511);
  //if (width >= 50 || height >= 50) {
    //sizeInfo.style.display = "inline";
  //} else {
  //  sizeInfo.style.display = "none";
  //}
  area.style.width = width + 'px';
//if (txtWidth.value > 1920)
//    sizeInfo.innerHTML = 1920 + " &#215; " + txtHeight.value;
//  else
//    sizeInfo.innerHTML = txtWidth.value + " &#215; " + txtHeight.value;

});

txtHeight.addEventListener('keyup', () => {
  if (txtHeight.value != "")
    Valid(txtHeight);
  height = Math.round(txtHeight.value / 2.7906976744186046511627906976744);
  //if (width >= 50 || height >= 50) {
    //sizeInfo.style.display = "inline";
  //} else {
  //  sizeInfo.style.display = "none";
//  }
  area.style.height = height + 'px';
  //if (txtHeight.value > 1200)
    //sizeInfo.innerHTML = txtWidth.value + " &#215; " + 1200;
  //else
    //sizeInfo.innerHTML = txtWidth.value + " &#215; " + txtHeight.value;

});

savePreset.addEventListener('click', () => {
  Validation(txtWidth, txtHeight, txtLeft, txtTop);
});

function Validation(...element) {
  let isValid = true;
  for (var i = 0; i < element.length; i++) {
    if (element[i].value == '') {
      element[i].classList.add('textBox-error');
      isValid = false;
    } else {
      element[i].classList.remove('textBox-error');
    }
  }
  if (isValid) {
    chrome.storage.sync.get(["presets"], results => {
      if (results.presets !== undefined) {
        data = results.presets;
        data.sort(Compare);
      }
    });

    let widthValue = txtWidth.value;
    let heightValue = txtHeight.value;
    let leftValue = txtLeft.value;
    let topValue = txtTop.value;
    let idValue;
    let sortorderValue;

    let isAnyEmptyPreset = false;
    for (let i = 0; i < data.length; i++) {
      if(data[i].isempty==true)
      {
        idValue = data[i].id;
        isAnyEmptyPreset = true;
        break;
      }
    }
    if (isAnyEmptyPreset == false) {
      chrome.runtime.sendMessage('error', function() {});
      return;
    }
    let backgroundColorValue = "222";
    let iconValue;

    data.map((preset) => {
      if (preset.id == idValue) {
        preset.width = widthValue;
        preset.height =heightValue;
        preset.left =leftValue;
        preset.top =topValue;
        preset.isempty = false;
      }
    });
    chrome.storage.sync.set({
      "presets": data
    }, () => {
      chrome.runtime.sendMessage('success', function() {});
      location.reload();
    });
  }
}

function Valid(element) {
  element.classList.remove('textBox-error');
}

function Compare(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder))
    return 1;
  if (parseInt(a.sortorder) < parseInt(b.sortorder))
    return -1;
  return 0;
}
