using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Domain.Entities.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Mobile { get; set; }
    }
}
