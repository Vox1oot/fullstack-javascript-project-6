import i18next from 'i18next'
import ru from '../locales/ru.js'

export const setupLocalization = async () => {
  await i18next.init({
    lng: 'ru',
    fallbackLng: 'ru',
    resources: {
      ru,
    },
  })
}

export default i18next
