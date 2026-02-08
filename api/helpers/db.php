<?php
function getDbConnection(): mysqli
{
    $env = getenv('APP_ENV') ?: 'prod'; // default prod for safety

    $cfgPath = ($env === 'dev')
        ? '/etc/smallproject/dev-db.php'
        : '/etc/smallproject/prod-db.php';

    $cfg = include $cfgPath;

    $conn = new mysqli($cfg['host'], $cfg['user'], $cfg['pass'], $cfg['db']);
    if ($conn->connect_error) {
        throw new Exception("DB connection failed");
        echo json_encode(["DB connection failed"]);
    }

    $conn->set_charset("utf8mb4");
    return $conn;
}
