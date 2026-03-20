# Лендинг-стартер: Воркшоп "Слепой импорт"

Короткий лендинг для привлечения на бесплатный воркшоп 28-29 марта.
Альтернатива длинному лонгриду для занятых предпринимателей.

## Деплой на Vercel

### Через CLI:
```bash
cd 06_starter_landing
npx vercel --prod
```

### Через GitHub:
1. Создать репозиторий `alexandra-ved-starter`
2. Подключить к Vercel
3. Root directory: `/`

## Ссылки

- **Регистрация:** t.me/AShumilova_bot?start=landing
- **Лонгрид:** alexandra-ved-longread.vercel.app
- **Метрика:** 102625647

## UTM-метки

Входящий трафик → лендинг:
- `utm_source=yandex|avito|telegram`
- `utm_medium=cpc|organic|post`
- `utm_campaign=workshop`

Лендинг → лонгрид:
- `utm_source=landing`
- `utm_medium=link`
- `utm_campaign=workshop`

## Файлы

```
index.html      — основной лендинг
img/
  alexandra.png — фото эксперта (без фона)
  favicon.png   — иконка
```

## Изменения

После редактирования:
1. `vercel --prod` для обновления
2. Проверить мобильную версию
3. Проверить Метрику (trackLinks)
