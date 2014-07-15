DROP TABLE IF EXISTS T_MONITOREDTARGET ;
CREATE TABLE T_MONITOREDTARGET (F_ID  VARCHAR(50) PRIMARY KEY,
                        F_NAME VARCHAR(100),
                        F_MONITORINGTIME LONG,
                        F_CANCELTIME LONG,
                        F_STATUS BOOLEAN,
                        F_DESCRIPTION VARCHAR(100),
                        F_TYPE VARCHAR(30));
DROP TABLE IF EXISTS T_PROCESS ;
CREATE TABLE T_PROCESS (
                        F_NAME VARCHAR(100),
                        F_TIME LONG,
                        F_SPENDTIME LONG,
                        F_FREEMEMORY LONG,
                        F_DESCRIPTION VARCHAR(100)
                        );

