document.getElementsByClassName('offices')[0].addEventListener('change', event => {
  localStorage.setItem("storageName", event.target.value);
  if (document.getElementsByClassName('focus')[0].value != '') {
    document.getElementsByClassName("start")[0].style.visibility = 'visible';
  }
});

document.getElementsByClassName('focus')[0].addEventListener('change', event => {
  if (document.getElementsByClassName('offices')[0].value != '') {
    document.getElementsByClassName("start")[0].style.visibility = 'visible';
  }
});