 /**
   * Go straight forward or back
   * Turns out this kit can't really do speed
   * 
   * @param  {String} dir - either 'fwd', or 'rev'
   * @param  {Number} time - the amount of time in ms to head in that direction
   * @return {Promise} when complete
   */
  var go = function (dir, time) {
    return new Promise( function (resolve) {
      motorLeft[dir](255);
      motorRight[dir](255);
      currentDirection = dir;
      setTimeout( function () {
        motorRight.stop();
        motorLeft.stop();
        currentDirection = null;
        resolve();
      },time); 
    }); 
  };