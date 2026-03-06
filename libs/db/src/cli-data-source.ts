import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { getDataSourceOptions } from './get-data-source-options';
config();

export default new DataSource(getDataSourceOptions());
