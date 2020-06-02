package dao

import (
  "context"
  "errors"
  "fmt"
  "github.com/wgentry2/ers-ngrx/server/api/middleware"
  "github.com/wgentry2/ers-ngrx/server/internal/domain/dto"
  "github.com/wgentry2/ers-ngrx/server/internal/domain/model"
  "github.com/wgentry2/ers-ngrx/server/internal/logger"
  "time"
)

type reimbursementDao struct {}

type ReimbursementDao interface {
  FindAll(ctx context.Context) []dto.ReimbursementDto
  FindMine(ctx context.Context) []dto.ReimbursementDto
  Create(ctx context.Context, form dto.ReimbursementForm) dto.ReimbursementDto
  Update(ctx context.Context, dto dto.ReimbursementDto) dto.ReimbursementDto
  Resolve(ctx context.Context, dto dto.ReimbursementDto) dto.ReimbursementDto
}

func (dao *reimbursementDao) FindAll(ctx context.Context) []dto.ReimbursementDto {
  info, _ := ctx.Value("info").(middleware.TokenContext)
  username, usernameOk := info.Get("username")
  if usernameOk {
    var reimbursements []dto.ReimbursementDto
    if err := withContext(ctx).Table("reimbursements").Joins("INNER JOIN users on users.id = reimbursements.user_id AND users.username <> ?", username).Find(&reimbursements).Error; err != nil {
      logger.WithContext(ctx).Infof("Failed to read all reimbursements: %+v", err)
      return make([]dto.ReimbursementDto, 0)
    }
    return reimbursements
  }
  return make([]dto.ReimbursementDto, 0)
}

func (dao *reimbursementDao) FindMine(ctx context.Context) []dto.ReimbursementDto {
  var reimbursements []dto.ReimbursementDto
  info, _ := ctx.Value("info").(middleware.TokenContext)
  username, usernameOk := info.Get("username")
  if err := withContext(ctx).Table("reimbursements").Joins("INNER JOIN users on users.id = reimbursements.user_id AND users.username = ?", username).Find(&reimbursements).Error; err != nil {
    logger.WithContext(ctx).Info("Failed to execute FIND MINE query for %s", username)
    return make([]dto.ReimbursementDto, 0)
  }
  if usernameOk {
    return reimbursements
  }
  panic(fmt.Errorf("Failed to find username in Token Context"))
}

func (dao *reimbursementDao) Create(ctx context.Context, form dto.ReimbursementForm) dto.ReimbursementDto {
  info, _ := ctx.Value("info").(middleware.TokenContext)
  username, usernameOk := info.Get("username")
  var user model.User
  if err := withContext(ctx).Find(&user, "username = ?", username).Error; err != nil || !usernameOk{
    logger.WithContext(ctx).Infof("Unable to create reimbursement: Failed to find user associated with %s", username)
    panic(errors.New(fmt.Sprintf("Failed to find user associated with username %s", username)))
  }
  reimbursement := model.Reimbursement{
    Amount:      form.Amount,
    Description: form.Description,
    Type:        form.Type,
    ExpenseDate: form.ExpenseDate,
    Status:      model.PENDING,
    CreatedBy:   username,
    UserId:      user.ID,
    User:        user,
  }

  if err := withContext(ctx).Save(&reimbursement).Error; err != nil {
    logger.WithContext(ctx).Infof("Failed to create reimbursement: %+v", reimbursement)
    panic(err)
  }

  return dto.ReimbursementDto{
    Id:             reimbursement.ID,
    Amount:         reimbursement.Amount,
    Description:    reimbursement.Description,
    Type:           reimbursement.Type,
    ExpenseDate:    reimbursement.ExpenseDate,
    ResolutionDate: reimbursement.ResolutionDate,
    Status:         reimbursement.Status,
    CreatedBy:      reimbursement.CreatedBy,
    ResolvedBy:     reimbursement.ResolvedBy,
  }
}

func (dao *reimbursementDao) Update(ctx context.Context, dto dto.ReimbursementDto) dto.ReimbursementDto {
  var reimbursement model.Reimbursement
  if err := withContext(ctx).Find(&reimbursement, "id = ?", dto.Id).Error; err != nil {
    logger.WithContext(ctx).Infof("Failed to locate reimbursement with id [%d] to update", dto.Id)
    panic(err)
  }
  if err := withContext(ctx).Model(&reimbursement).Updates(model.Reimbursement{
    Amount:      dto.Amount,
    Description: dto.Description,
    Type:        dto.Type,
    ExpenseDate: dto.ExpenseDate,
  }).Error; err != nil {
    logger.WithContext(ctx).Infof("Failed to update reimbursement: %+v", reimbursement)
    panic(err)
  }
  return dto
}


func (dao *reimbursementDao) Resolve(ctx context.Context, dto dto.ReimbursementDto) dto.ReimbursementDto {
  var reimbursement model.Reimbursement
  if err := withContext(ctx).Find(&reimbursement, "id = ?", dto.Id).Error; err != nil {
    logger.WithContext(ctx).Infof("Failed to locate reimbursement with id [%d] to update", dto.Id)
    panic(err)
  }
  info, ok := ctx.Value("info").(middleware.TokenContext)
  username, _ = info.Get("username")
  if err := withContext(ctx).Model(&reimbursement).Updates(model.Reimbursement{
    Amount:      dto.Amount,
    Description: dto.Description,
    ExpenseDate: dto.ExpenseDate,
    ResolvedBy:  username,
    ResolutionDate: time.Now().UTC().UnixNano() / 1e6,
    Status:      dto.Status,
  }).Error; err != nil && ok {
    logger.WithContext(ctx).Infof("Failed to update %s's reimbursement: %+v", username, reimbursement)
    panic(err)
  }
  return dto
}

func Reimbursement() ReimbursementDao {
  return &reimbursementDao{}
}
