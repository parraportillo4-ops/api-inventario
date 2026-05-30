package com.unicartagena.APi_inventario.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SqliteSchemaPatcher implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(SqliteSchemaPatcher.class);

    private final JdbcTemplate jdbcTemplate;

    public SqliteSchemaPatcher(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void afterPropertiesSet() {
        addColumnIfMissing("productos", "precio", "REAL DEFAULT 0");
        addColumnIfMissing("productos", "id_usuario", "INTEGER");
        addColumnIfMissing("inventario", "precio", "REAL DEFAULT 0");

        jdbcTemplate.update("UPDATE productos SET precio = 0 WHERE precio IS NULL");
        jdbcTemplate.update("UPDATE inventario SET precio = 0 WHERE precio IS NULL");
    }

    private void addColumnIfMissing(String table, String column, String definition) {
        if (columnExists(table, column)) {
            return;
        }
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
            log.info("Columna {}.{} agregada", table, column);
        } catch (Exception ex) {
            log.warn("No se pudo agregar {}.{}: {}", table, column, ex.getMessage());
        }
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pragma_table_info(?) WHERE name = ?",
                Integer.class,
                table,
                column
        );
        return count != null && count > 0;
    }
}
