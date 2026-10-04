using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class EodhdSymbol
{
    public int Id { get; set; }

    public string Code { get; set; }

    public string Name { get; set; }

    public string Country { get; set; }

    public string Exchange { get; set; }

    public string Currency { get; set; }

    public string Type { get; set; }

    public string Isin { get; set; }

    public DateTime CreatedDate { get; set; }

    public bool? IsActive { get; set; }

    public string IndustryGroup { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
