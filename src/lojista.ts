// Entry da versão LOJISTA — importa a fonte completa (com custos)
import data from '../catalog-data.json';
import { initApp, type CatalogData } from './app';

initApp(data as CatalogData, 'lojista');
