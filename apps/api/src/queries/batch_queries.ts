const GET_COUNTER_FROM_DB = `SELECT counter FROM global_counter WHERE id = 1 FOR UPDATE`
const UPDATE_COUNTER_IN_DB = `UPDATE global_counter SET counter = ? WHERE id = 1`


const BatchQueries = {GET_COUNTER_FROM_DB, UPDATE_COUNTER_IN_DB};
export default BatchQueries;
