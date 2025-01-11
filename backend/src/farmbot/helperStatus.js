
/**
 * 
 * @param {Object} status 
 * @returns 
 */
function getPosition(status){
   return status.location_data?.position
}

function getWorkingState(status){
   return status.informational_settings?.busy
}

function getLockState(status){
   return status.informational_settings?.locked
}

function emitInfoFromStatus(status, io){
   io.emit("position", getPosition(status))
   io.emit("workingState", getWorkingState(status))
   io.emit("lock", getLockState(status))
}

module.exports = {emitInfoFromStatus};