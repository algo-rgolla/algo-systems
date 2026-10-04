using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class UserAccessLog
{
    public int Id { get; set; }

    public string UserName { get; set; }

    public string Url { get; set; }

    public DateTime? LoggedTime { get; set; }

    public string Comments { get; set; }
}
