using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Domain.Entities.Models
{
    public static class ModelBuilderExtensions
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            //Insert the Seed Data
            modelBuilder.Entity<SectorType>().HasData
            (
                new SectorType
                {
                    Id = 1,
                    Code = "XEJ",
                    Name = "Energy",
                    Description = "Energy",
                    CreatedBy = "Admin",
                    CreatedDate = DateTime.Now,
                    ModifiedBy = "Admin",
                    ModifiedDate = DateTime.Now
                }
            );
        }
    }
}
