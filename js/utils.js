function docById(id) {
    return document.getElementById(id);
}

function last(myList) {
    var i = myList.length;
    if (i == 0) {
	return null;
    } else {
	return myList[i - 1];
    }
}

