using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Common.Interfaces
{
    public interface IUserContext
    {
        string? UserId { get; }
        string? Email { get; }
        string? RequestUrl { get; }
    }
}
