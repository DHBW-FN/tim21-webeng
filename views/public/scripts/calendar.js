function search_calendar(){
    let input = document.getElementById('searchbar').value
    input = input.toLowerCase();
    let entries = document.getElementsByClassName('calendarEntry');

    for (let i = 0; i < entries.length; i++) {
        if (!entries[i].innerHTML.toLowerCase().includes(input)) {
            entries[i].style.display="none";
        }
        else {
            entries[i].style.display= null;
        }
    }
}