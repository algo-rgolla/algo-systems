using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class SectorIndustryMapper
{
    public int Id { get; set; }

    public int SectorId { get; set; }

    public int IndustryGroupId { get; set; }

    public DateTime CreatedDate { get; set; }

    public string CreatedBy { get; set; }

    public DateTime ModifiedDate { get; set; }

    public string ModifiedBy { get; set; }

    public bool IsDeleted { get; set; }

    public int? DisplayOrder { get; set; }
}
