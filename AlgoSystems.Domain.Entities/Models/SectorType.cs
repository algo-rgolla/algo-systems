using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class SectorType
{
    public int Id { get; set; }

    public string Code { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public DateTime CreatedDate { get; set; }

    public string CreatedBy { get; set; }

    public DateTime ModifiedDate { get; set; }

    public string ModifiedBy { get; set; }

    public bool IsDeleted { get; set; }

    public int? DisplayOrder { get; set; }
}
