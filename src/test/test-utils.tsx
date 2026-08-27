import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { articleApi } from '../entities/article/articleApi'
import { rewriteApi } from '../entities/rewrite/rewriteApi'

export function renderWithProviders(ui: ReactElement) {
  const store = configureStore({
    reducer: {
      [articleApi.reducerPath]: articleApi.reducer,
      [rewriteApi.reducerPath]: rewriteApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(articleApi.middleware, rewriteApi.middleware),
  })

  return render(<Provider store={store}>{ui}</Provider>)
}