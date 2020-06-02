package dao

import (
  "context"
  "fmt"
  "github.com/jinzhu/gorm"
  _ "github.com/jinzhu/gorm/dialects/mysql"
  "github.com/wgentry2/ers-ngrx/server/internal/domain/model"
  "github.com/wgentry2/ers-ngrx/server/internal/logger"
  "go.elastic.co/apm/module/apmgorm"
  "golang.org/x/crypto/bcrypt"
  "os"
  "strconv"
  "time"
)

var (
  db *gorm.DB
  host = getEnv("HOST", "localhost")
  port = getEnv("PORT", "3306")
  username = getEnv("MYSQL_USER", "ers-admin")
  password = getEnv("MYSQL_PASSWORD", "Password123!")
  database = getEnv("MYSQL_DATABASE", "ers_ngrx")
  reconnectAttempts = getEnvInt("RECONNECT_ATTEMPTS", 5)
  connectionString = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", username, password, host, port, database)
)

func init() {
  database, err := connectAndRetryOnFail()
  if err != nil {
    panic(err)
  }
  runMigrations(database)
  db = database
}



func runMigrations(db *gorm.DB) {
  db.AutoMigrate(model.User{}, model.Role{}, model.UserDetails{}, model.Reimbursement{})
  initAdminIfNotPresent(db)
  logger.Get().Info("Database bootstrap complete!")
}

func initAdminIfNotPresent(db *gorm.DB) {
  var user model.User
  var count int
  if db.Find(&user).Count(&count); count == 0 {
    pwd, err := bcrypt.GenerateFromPassword([]byte("Password123!"), 13)
    if err != nil {
      logger.Get().Errorf("Failed to hash password: %+v", err)
      panic(err)
    }
    admin := model.User{
      Username: "admin",
      PwdHash:  pwd,
    }
    if err := db.Save(&admin).Error; err != nil {
      logger.Get().Errorf("Failed to save admin: %+v", err)
      panic(err)
    }
    adminDetails := model.UserDetails{
      Position:   "Administrator",
      Department: "HR",
      Email:      "admin@ers.io",
      FirstName:  "Admin",
      LastName:   "User",
      UserId:     admin.ID,
      User:       admin,
    }
    if err := db.Save(&adminDetails).Error; err != nil {
      logger.Get().Errorf("Failed to save admin details: %+v", err)
      panic(err)
    }

    adminRole := model.Role{
      Name:   "ROLE_MANAGER",
      UserId: admin.ID,
      User:   admin,
    }
    if err := db.Save(&adminRole).Error; err != nil {
      logger.Get().Errorf("Failed to save admin role: %+v", err)
      panic(err)
    }
    logger.Get().Info("Bootstrapped application with admin user!")
  }
}

func connectAndRetryOnFail() (*gorm.DB, error) {
  retries := 0
  for retries < reconnectAttempts {
    database, err := apmgorm.Open("mysql", connectionString)
    if err != nil {
      logger.Get().Errorf("Failed to connect to database, %+v", err)
      time.Sleep(5 * time.Second)
      retries++
    } else {
      return database, nil
    }
  }
  return nil, fmt.Errorf("Failed to connect to database after %d attempts.", reconnectAttempts)
}

func getEnv(key string, defaultValue string) string {
  if value, ok := os.LookupEnv(key); ok {
    return value
  }
  return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
  if value, ok := os.LookupEnv(key); ok {
    val, err := strconv.Atoi(value)
    if err != nil {
      logger.Get().Errorf("Failed to convert %s into type int", value)
    }
    return val
  }
  logger.Get().Infof("Unable to find environment variable with key %s: Falling back to %d", key, defaultValue)
  return defaultValue
}

func withContext(ctx context.Context) *gorm.DB {
  return apmgorm.WithContext(ctx, db)
}
