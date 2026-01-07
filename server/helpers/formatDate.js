export default (str) => {
  const date = new Date(str)
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return date.toLocaleString('ru-RU', options).replace(' г.,', ' в')
}
