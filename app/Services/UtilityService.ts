export default class UtilityService {
  /**
   * Shuffle an array's items
   * From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   * @param array
   */
  public static shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}
