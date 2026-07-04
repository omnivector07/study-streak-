/**
 * Returns today's date as 'YYYY-MM-DD' (server local time).
 */
function todayStr() {
  return formatDate(new Date());
}

/**
 * Returns yesterday's date as 'YYYY-MM-DD' (server local time).
 */
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = { todayStr, yesterdayStr };
