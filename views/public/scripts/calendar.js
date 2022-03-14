/**
 * Search Calendar and hide elements not containing input
 */
function search_calendar(){
    let input = document.getElementById('searchbar').value
    input = input.toLowerCase();
    let entries = document.getElementsByClassName('calendarEntry');

    // Iterate over all entry elements
    for (let i = 0; i < entries.length; i++) {
        // Set style to none if input not included in entry
        if (!entries[i].innerHTML.toLowerCase().includes(input)) {
            entries[i].style.display="none";
        }
        //Reset style if included
        else {
            entries[i].style.display= null;
        }
    }
}